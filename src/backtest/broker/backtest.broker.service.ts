import { Injectable } from '@nestjs/common';
import {
  DEFAULT_KLINE_LIMIT,
  OrderStatus,
  TradeSide,
} from '../../core/constants';
import { BacktestBroker } from './backtest.broker.interface';
import { Position } from '../../core/interfaces/broker.interface';
import { Order } from '../../core/interfaces/market.interface';
import { BacktestFeederService } from '../feeder/backtest.feeder.service';
import { Interval } from '../../core/types';
import { toTimestampInterval } from '../backtest.utils';
import { toPair } from '../../core/utils';
import { KLines } from '../../core/structures/klines';

/**
 * Backtest Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestBrokerService implements BacktestBroker {
  private orderIdCounter: number;
  private interval: Interval;
  private clockInterval: number;
  private currentClock: number;

  private readonly balances: Map<string, number>;
  private readonly positions: Map<string, Position>;

  constructor(private readonly feeder: BacktestFeederService) {
    this.orderIdCounter = 0;
    // The initial clock is one day ago
    this.currentClock = Date.now() - 86400;
    this.balances = new Map<string, number>();
    this.positions = new Map<string, Position>();
  }

  async placeMarketLong(symbol: string, size: number): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      symbol: symbol,
      price: await this.getMarketPrice(symbol),
      size: size,
      filledSize: 0.0,
      side: TradeSide.LONG,
      status: OrderStatus.FILLED,
    };
    this.updatePositionByFilledOrder(order);
    return order;
  }

  async placeMarketShort(symbol: string, size: number): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      symbol: symbol,
      price: await this.getMarketPrice(symbol),
      size: size,
      filledSize: 0.0,
      side: TradeSide.SHORT,
      status: OrderStatus.FILLED,
    };
    this.updatePositionByFilledOrder(order);
    return order;
  }

  async getBalance(currency: string): Promise<number> {
    let totalUnrealizedPnL = 0.0;
    for (const [symbol, position] of this.positions) {
      if (toPair(symbol).quote == currency && position && position.size > 0) {
        const marketPrice = await this.getMarketPrice(symbol);
        totalUnrealizedPnL +=
          (position.side == TradeSide.LONG
            ? marketPrice - position.entryPrice
            : position.entryPrice - marketPrice) * position.size;
      }
    }
    return this.balances.get(currency) + totalUnrealizedPnL;
  }

  async getMarketPrice(symbol: string): Promise<number> {
    const kLines = await this.feeder.getKLinesInBinanceCSV(
      symbol,
      this.interval,
      this.clock,
      1,
    );
    return kLines[0].close;
  }

  async getPosition(symbol: string): Promise<Position> {
    const position = this.positions.get(symbol);
    if (position) {
      // Compute unrealized PnL
      const marketPrice = await this.getMarketPrice(symbol);
      this.positions.set(symbol, {
        ...position,
        unrealizedPnL:
          (position.side == TradeSide.LONG
            ? marketPrice - position.entryPrice
            : position.entryPrice - marketPrice) * position.size,
      });
    }
    return position;
  }

  async getKLines(
    symbol: string,
    interval: Interval,
    limit: number = DEFAULT_KLINE_LIMIT,
  ): Promise<KLines> {
    const kLines = await this.feeder.getKLinesInBinanceCSV(
      symbol,
      interval,
      this.clock,
      DEFAULT_KLINE_LIMIT,
    );

    return new KLines(
      kLines.length <= limit ? kLines : kLines.slice(kLines.length - limit),
    );
  }

  initClockAndInterval(clock: number, interval: Interval) {
    this.currentClock = clock;
    this.interval = interval;
    this.clockInterval = toTimestampInterval(interval);
  }

  nextClock() {
    this.currentClock += this.clockInterval;
  }

  setBalance(symbol: string, amount: number): void {
    this.balances.set(symbol, amount);
  }

  get clock() {
    return this.currentClock;
  }

  private get orderId() {
    return `${this.orderIdCounter++}`;
  }

  private updatePositionByFilledOrder(order: Order): void {
    const position: Position = this.positions.get(order.symbol);
    if (position) {
      // If position is open, then update position and balance
      if (position.side == order.side) {
        // If position has the same side as the order, increase the position
        this.positions.set(order.symbol, {
          entryPrice:
            (position.entryPrice * position.size + order.price * order.size) /
            (position.size + order.size),
          side: position.side,
          size: position.size + order.size,
        });
      } else {
        // If position has the different side from the order, then realize PnL and decrease the position
        this.realizePnL(position, order);
        if (position.size > order.size) {
          this.positions.set(order.symbol, {
            ...position,
            size: position.size - order.size,
          });
        } else if (position.size == order.size) {
          this.positions.set(order.symbol, null);
        } else {
          this.positions.set(order.symbol, {
            ...position,
            side: order.side,
            size: order.size - position.size,
          });
        }
      }
    } else {
      // If position is closed, then open position
      this.positions.set(order.symbol, {
        entryPrice: order.price,
        side: order.side,
        size: order.size,
      });
    }
  }

  /**
   * Realize PnL from an open position by a filled order
   *
   * @param position position before the filled order
   * @param order filled order
   * @private
   */
  private realizePnL(position: Position, order: Order): void {
    // Compute realized PnL
    let realizedPnl: number = 0.0;
    if (position.side != order.side && position.size > 0) {
      realizedPnl =
        (position.side == TradeSide.LONG
          ? order.price - position.entryPrice
          : position.entryPrice - order.price) *
        Math.min(order.size, position.size);
    }

    // Update balance
    const quote = toPair(order.symbol).quote;
    this.balances.set(quote, this.balances.get(quote) + realizedPnl);
  }
}

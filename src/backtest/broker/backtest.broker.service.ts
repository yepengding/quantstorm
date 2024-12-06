import { Injectable, Scope } from '@nestjs/common';
import {
  Currency,
  DEFAULT_KLINE_LIMIT,
  OrderStatus,
  OrderType,
  TradeSide,
  TradeType,
} from '../../core/constants';
import { BacktestBroker } from './backtest.broker.interface';
import { Position } from '../../core/interfaces/broker.interface';
import { Order, Trade } from '../../core/interfaces/market.interface';
import { BacktestFeederService } from '../feeder/backtest.feeder.service';
import { Interval } from '../../core/types';
import { toTimestampInterval } from '../backtest.utils';
import { KLines } from '../../core/structures/klines';
import { History } from '../structures/history';
import { BasePair, Pair } from '../../core/structures/pair';
import { ConfigService } from '@nestjs/config';
import { BacktestResult } from '../structures/result';

/**
 * Backtest Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable({ scope: Scope.REQUEST })
export class BacktestBrokerService implements BacktestBroker {
  private readonly tick: number;
  private readonly commission: {
    taker: number;
    maker: number;
  };

  private orderIdCounter: number;
  private tradeIdCounter: number;
  private interval: Interval;
  private clockInterval: number;
  private currentClock: number;

  private readonly balances: Map<Currency, number>;
  private readonly positions: Map<string, Position>;
  private readonly orders: Map<string, Order>;
  private readonly history: History;

  constructor(
    private readonly configService: ConfigService,
    private readonly feeder: BacktestFeederService,
  ) {
    this.tick = this.configService.get<number>('backtest.tick') / 10000;
    this.commission = {
      taker:
        this.configService.get<number>('backtest.commission.taker') / 10000,
      maker:
        this.configService.get<number>('backtest.commission.maker') / 10000,
    };
    this.orderIdCounter = 0;
    this.tradeIdCounter = 0;
    // The initial clock is one day ago
    this.currentClock = Date.now() - 86400;
    this.balances = new Map<Currency, number>();
    this.positions = new Map<string, Position>();
    this.orders = new Map<string, Order>();
    this.history = new History();
  }

  async placeMarketLong(pair: Pair, size: number): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: await this.getMarketPrice(pair),
      size: pair.roundSize(size),
      filledSize: pair.roundSize(size),
      side: TradeSide.LONG,
      timestamp: this.currentClock,
      status: OrderStatus.FILLED,
    };
    this.orders.set(order.id, order);
    this.updatePositionAndBalanceByFilledOrder(order);
    return order;
  }

  async placeMarketShort(pair: Pair, size: number): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: await this.getMarketPrice(pair),
      size: pair.roundSize(size),
      filledSize: pair.roundSize(size),
      side: TradeSide.SHORT,
      timestamp: this.currentClock,
      status: OrderStatus.FILLED,
    };
    this.orders.set(order.id, order);
    this.updatePositionAndBalanceByFilledOrder(order);
    return order;
  }

  async placeLimitLong(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.LIMIT,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.LONG,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };
    const marketPrice = await this.getMarketPrice(pair);
    if (price >= marketPrice) {
      // If price >= market price, then place market long order
      order.price = marketPrice;
      order.filledSize = size;
      order.status = OrderStatus.FILLED;
      this.updatePositionAndBalanceByFilledOrder(order);
    }

    this.orders.set(order.id, order);
    return order;
  }

  async placeLimitShort(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.LIMIT,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.SHORT,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };
    const marketPrice = await this.getMarketPrice(pair);
    if (price <= marketPrice) {
      // If price <= market price, then place market short order
      order.price = marketPrice;
      order.filledSize = size;
      order.status = OrderStatus.FILLED;
      this.updatePositionAndBalanceByFilledOrder(order);
    }

    this.orders.set(order.id, order);
    return order;
  }

  async placeGTXLong(pair: Pair, size: number, price: number): Promise<Order> {
    return await this.placeLimitLong(pair, size, price);
  }

  async placeGTXShort(pair: Pair, size: number, price: number): Promise<Order> {
    return await this.placeLimitShort(pair, size, price);
  }

  async placeStopMarketLong(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.LONG,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };

    this.orders.set(order.id, order);
    return order;
  }

  async placeStopMarketShort(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.SHORT,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };

    this.orders.set(order.id, order);
    return order;
  }

  public async cancelOrder(id: string, pair: Pair): Promise<boolean> {
    const order = this.orders.get(id);
    if (!!order) {
      order.status = OrderStatus.CANCELLED;
      return true;
    } else {
      return false;
    }
  }

  public async cancelOrders(ids: string[], pair: Pair): Promise<boolean> {
    let ret = true;
    for (const id of ids) {
      ret = await this.cancelOrder(id, pair);
      if (!ret) {
        return false;
      }
    }
    return ret;
  }

  async getBalance(currency: Currency): Promise<number> {
    let totalUnrealizedPnL = 0.0;
    for (const [symbol, position] of this.positions) {
      const pair = BasePair.fromSymbol(symbol);
      if (pair.quote == currency && position && position.size > 0) {
        const marketPrice = await this.getMarketPrice(pair);
        totalUnrealizedPnL +=
          (position.side == TradeSide.LONG
            ? marketPrice - position.entryPrice
            : position.entryPrice - marketPrice) * position.size;
      }
    }
    return this.balances.get(currency) + totalUnrealizedPnL;
  }

  async getMarketPrice(pair: Pair): Promise<number> {
    const kLines = await this.feeder.getBinanceKLines(
      pair,
      this.interval,
      this.clock,
      1,
    );
    if (kLines.length == 0) {
      throw new Error('Failed to get the market price.');
    }
    return kLines[0].close;
  }

  async getBestBid(pair: Pair): Promise<number> {
    return (await this.getMarketPrice(pair)) * (1 - this.tick);
  }

  async getBestAsk(pair: Pair): Promise<number> {
    return (await this.getMarketPrice(pair)) * (1 + this.tick);
  }

  async getOrder(id: string, pair: Pair): Promise<Order> {
    const order = this.orders.get(id);
    return order ? order : null;
  }

  // TODO
  async getOpenOrders(pair: Pair): Promise<Order[]> {
    return [];
  }

  async getPosition(pair: Pair): Promise<Position> {
    const position = this.positions.get(pair.toSymbol());
    if (position) {
      // Compute unrealized PnL
      const marketPrice = await this.getMarketPrice(pair);
      this.positions.set(pair.toSymbol(), {
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
    pair: Pair,
    interval: Interval,
    limit: number = DEFAULT_KLINE_LIMIT,
  ): Promise<KLines> {
    const kLines = await this.feeder.getBinanceKLines(
      pair,
      interval,
      this.clock,
      DEFAULT_KLINE_LIMIT,
    );

    return new KLines(
      kLines.length <= limit ? kLines : kLines.slice(kLines.length - limit),
    );
  }

  private updatePositionAndBalanceByFilledOrder(order: Order): void {
    let pnl: number = 0;
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
        pnl = this.realizePnL(position, order);
        if (position.size > order.size) {
          this.positions.set(order.symbol, {
            ...position,
            size: position.size - order.size,
          });
        } else if (position.size == order.size) {
          this.positions.set(order.symbol, null);
        } else {
          this.positions.set(order.symbol, {
            entryPrice: order.price,
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
    const fee = this.deductCommission(order);
    this.history.addTrade(this.toTrade(order, pnl, fee));
  }

  /**
   * Realize PnL from an open position by a filled order
   *
   * @param position position before the filled order
   * @param order filled order
   * @private
   * @return realized Pnl
   */
  private realizePnL(position: Position, order: Order): number {
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
    const quote = BasePair.fromSymbol(order.symbol).quote;
    this.balances.set(quote, this.balances.get(quote) + realizedPnl);
    return realizedPnl;
  }

  /**
   * Deduct commission fee by the given filled order
   *
   * @param order filled order
   * @private
   * @return commission fee
   */
  private deductCommission(order: Order): number {
    const fee =
      (order.type == OrderType.LIMIT
        ? this.commission.maker
        : this.commission.taker) *
      order.price *
      order.size;
    const quote = BasePair.fromSymbol(order.symbol).quote;
    this.balances.set(quote, this.balances.get(quote) - fee);
    return fee;
  }

  setBalance(currency: Currency, amount: number): void {
    this.balances.set(currency, amount);
  }

  initClockAndInterval(clock: number, interval: Interval) {
    this.currentClock = clock;
    this.interval = interval;
    this.clockInterval = toTimestampInterval(interval);
    this.history.flush(this.currentClock, new Map(this.balances));
  }

  async nextClock() {
    this.currentClock += this.clockInterval;
    // Fill open orders
    for (const order of this.orders.values()) {
      if (order.status == OrderStatus.OPEN) {
        const kLine = (
          await this.getKLines(
            BasePair.fromSymbol(order.symbol),
            this.interval,
            1,
          )
        ).at(0);
        if (kLine.low <= order.price && order.price <= kLine.high) {
          // If the order price is between the low and high of the next K-line, then fill the limit order (place market order)
          order.filledSize = order.size;
          order.status = OrderStatus.FILLED;
          this.updatePositionAndBalanceByFilledOrder(order);
        }
      }
    }
    // Update balances
    const balances = new Map<Currency, number>();
    for (const currency of this.balances.keys()) {
      balances.set(currency, await this.getBalance(Currency.USDC));
    }

    // Flush history
    this.history.flush(this.currentClock, balances);
  }

  get clock() {
    return this.currentClock;
  }

  private get orderId() {
    return `${this.orderIdCounter++}`;
  }

  private get tradeId() {
    return `${this.tradeIdCounter++}`;
  }

  get backtestResult() {
    return new BacktestResult(this.history.allRecords);
  }

  private toTrade(order: Order, pnl: number, fee: number): Trade {
    return {
      id: this.tradeId,
      type: order.type == OrderType.LIMIT ? TradeType.MAKER : TradeType.TAKER,
      symbol: order.symbol,
      price: order.price,
      size: order.filledSize,
      side: order.side,
      timestamp: this.currentClock,
      pnl: pnl,
      fee: fee,
    };
  }
}

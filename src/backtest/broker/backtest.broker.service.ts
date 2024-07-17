import { Injectable } from '@nestjs/common';
import {
  DEFAULT_KLINE_LIMIT,
  OrderStatus,
  TradeSide,
} from '../../core/constants';
import { BacktestBroker } from './backtest.broker.interface';
import { Position } from '../../core/interfaces/broker.interface';
import { KLine, Order } from '../../core/interfaces/market.interface';
import { BacktestDataService } from '../data/backtest.data.service';
import { Interval } from '../../core/types';
import { toTimestampInterval } from '../backtest.utils';

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

  constructor(private readonly data: BacktestDataService) {
    this.orderIdCounter = 0;
    // The initial clock is one day ago
    this.currentClock = Date.now() - 86400;
    this.balances = new Map<string, number>();
    this.positions = new Map<string, Position>();
    // this.kLines = new Map<string, KLine[]>();
  }

  async placeMarketLong(symbol: string, size: number): Promise<Order> {
    return {
      id: this.orderId,
      symbol: symbol,
      price: await this.getMarketPrice(symbol),
      size: size,
      filledSize: 0.0,
      side: TradeSide.LONG,
      status: OrderStatus.FILLED,
    };
  }

  async placeMarketShort(symbol: string, size: number): Promise<Order> {
    return {
      id: this.orderId,
      symbol: symbol,
      price: await this.getMarketPrice(symbol),
      size: size,
      filledSize: 0.0,
      side: TradeSide.SHORT,
      status: OrderStatus.FILLED,
    };
  }

  async getMarketPrice(symbol: string): Promise<number> {
    const kLines = await this.data.getKLinesInBinanceCSV(
      symbol,
      this.interval,
      this.clock,
      1,
    );
    return kLines[0].close;
  }

  async getPosition(symbol: string): Promise<Position> {
    return this.positions.get(symbol);
  }

  async getKLines(
    symbol: string,
    interval: Interval,
    limit: number = DEFAULT_KLINE_LIMIT,
  ): Promise<KLine[]> {
    const kLines = await this.data.getKLinesInBinanceCSV(
      symbol,
      interval,
      this.clock,
      DEFAULT_KLINE_LIMIT,
    );

    return kLines.length <= limit
      ? kLines
      : kLines.slice(kLines.length - limit);
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
}

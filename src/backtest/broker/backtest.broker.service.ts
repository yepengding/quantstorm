import { Injectable } from '@nestjs/common';
import { Broker } from '../../core/interfaces/broker.interface';
import { Order } from '../../core/interfaces/order.interface';
import { KLine } from '../../core/interfaces/k-line.interface';
import {
  DEFAULT_KLINE_LIMIT,
  OrderStatus,
  TradeSide,
} from '../../core/constants';

/**
 * Backtest Broker Service
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestBrokerService implements Broker {
  private kLines: Map<string, KLine[]>;
  private orderId: number;

  constructor() {
    this.kLines = new Map<string, KLine[]>();
    this.orderId = 0;
  }

  async placeMarketLong(symbol: string, size: number): Promise<Order> {
    return {
      id: `${this.orderId++}`,
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
      id: `${this.orderId++}`,
      symbol: symbol,
      price: await this.getMarketPrice(symbol),
      size: size,
      filledSize: 0.0,
      side: TradeSide.SHORT,
      status: OrderStatus.FILLED,
    };
  }

  async getMarketPrice(symbol: string): Promise<number> {
    return this.kLines.get(symbol).at(-1).close;
  }

  async getKLines(
    symbol: string,
    limit: number = DEFAULT_KLINE_LIMIT,
  ): Promise<KLine[]> {
    if (this.kLines.has(symbol)) {
      const kLines = this.kLines.get(symbol);
      return kLines.length <= limit
        ? kLines
        : kLines.slice(kLines.length - limit);
    } else {
      return [];
    }
  }

  setKLines(symbol: string, kLines: KLine[]) {
    this.kLines.set(symbol, kLines);
  }
}

import { KLine, Order } from './market.interface';
import { Interval } from '../types';
import { TradeSide } from '../constants';

export interface Broker {
  placeMarketLong(symbol: string, size: number): Promise<Order>;

  placeMarketShort(symbol: string, size: number): Promise<Order>;

  getMarketPrice(symbol: string): Promise<number>;

  getPosition(symbol: string): Promise<Position>;

  getKLines(
    symbol: string,
    interval: Interval,
    limit?: number,
  ): Promise<KLine[]>;
}

export interface Position {
  entryPrice: number;
  side: TradeSide;
  size: number;
}

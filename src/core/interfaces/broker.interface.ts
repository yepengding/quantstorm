import { Order } from './market.interface';
import { Interval } from '../types';
import { TradeSide } from '../constants';
import { KLines } from '../structures';

export interface Broker {
  placeMarketLong(symbol: string, size: number): Promise<Order>;

  placeMarketShort(symbol: string, size: number): Promise<Order>;

  getBalance(currency: string): Promise<number>;

  getMarketPrice(symbol: string): Promise<number>;

  getPosition(symbol: string): Promise<Position>;

  getKLines(
    symbol: string,
    interval: Interval,
    limit?: number,
  ): Promise<KLines>;
}

export interface Position {
  entryPrice: number;
  side: TradeSide;
  size: number;
  unrealizedPnL?: number;
}

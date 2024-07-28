import { Order } from './market.interface';
import { Interval } from '../types';
import { TradeSide } from '../constants';
import { KLines } from '../structures/klines';
import { Pair } from '../structures/pair';

export interface Broker {
  placeMarketLong(pair: Pair, size: number): Promise<Order>;

  placeMarketShort(pair: Pair, size: number): Promise<Order>;

  placeLimitLong(pair: Pair, size: number, price: number): Promise<Order>;

  placeLimitShort(pair: Pair, size: number, price: number): Promise<Order>;

  cancelOrder(id: string, pair: Pair): Promise<boolean>;

  getBalance(currency: string): Promise<number>;

  getMarketPrice(pair: Pair): Promise<number>;

  getPosition(pair: Pair): Promise<Position>;

  getKLines(pair: Pair, interval: Interval, limit?: number): Promise<KLines>;
}

export interface Position {
  entryPrice: number;
  side: TradeSide;
  size: number;
  unrealizedPnL?: number;
}

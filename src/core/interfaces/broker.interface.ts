import { Order } from './order.interface';
import { KLine } from './k-line.interface';

export interface Broker {
  placeMarketLong(symbol: string, size: number): Promise<Order>;

  placeMarketShort(symbol: string, size: number): Promise<Order>;

  getMarketPrice(symbol: string): Promise<number>;

  getKLines(symbol: string, limit?: number): Promise<KLine[]>;
}

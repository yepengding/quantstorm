import { Order } from './order.interface';

export interface Broker {
  placeMarketLong(symbol: string, size: number): Order;

  placeMarketShort(symbol: string, size: number): Order;
}

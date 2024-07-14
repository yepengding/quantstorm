import { OrderStatus, TradeSide } from './constant';

export interface Broker {
  placeMarketLong(symbol: string, size: number): Order;

  placeMarketShort(symbol: string, size: number): Order;
}

export interface Order {
  id: string;
  symbol: string;
  price: number;
  size: number;
  filledSize: number;
  side: TradeSide;
  status: OrderStatus;
}

export interface Strategy {
  init(): void;

  next(): void;
}

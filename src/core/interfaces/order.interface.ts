import { OrderStatus, TradeSide } from '../constants';

export interface Order {
  id: string;
  symbol: string;
  price: number;
  size: number;
  filledSize: number;
  side: TradeSide;
  status: OrderStatus;
}

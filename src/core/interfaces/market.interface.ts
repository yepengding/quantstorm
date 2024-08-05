import { OrderStatus, OrderType, TradeSide } from '../constants';

export interface KLine {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface Order {
  id: string;
  type: OrderType;
  symbol: string;
  price: number;
  size: number;
  filledSize: number;
  side: TradeSide;
  timestamp: number;
  status: OrderStatus;
}

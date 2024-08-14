import { OrderStatus, OrderType, TradeSide, TradeType } from '../constants';

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

export interface Trade {
  id: string;
  type: TradeType;
  symbol: string;
  price: number;
  size: number;
  side: TradeSide;
  timestamp: number;
  pnl: number;
  fee: number;
}

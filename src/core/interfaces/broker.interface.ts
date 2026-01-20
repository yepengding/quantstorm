import { Order } from './market.interface';
import { Interval } from '../types';
import { Currency, TradeSide } from '../constants';
import { KLines } from '../structures/klines';
import { Pair } from '../structures/pair';

export interface Broker {
  cancelOrder(id: string, pair: Pair): Promise<boolean>;

  cancelConditionalOrder(id: string, pair: Pair): Promise<boolean>;

  cancelOrders(ids: string[], pair: Pair): Promise<boolean>;

  cancelConditionalOrders(ids: string[], pair: Pair): Promise<boolean>;

  getBalance(currency: Currency): Promise<number>;

  getMarketPrice(pair: Pair): Promise<number>;

  getKLines(pair: Pair, interval: Interval, limit?: number): Promise<KLines>;

  getBestBid(pair: Pair): Promise<number>;

  getBestAsk(pair: Pair): Promise<number>;

  getOpenOrders(pair: Pair): Promise<Order[]>;

  getOpenConditionalOrders(pair: Pair): Promise<Order[]>;

  getOrder(id: string, pair: Pair, logRaw?: boolean): Promise<Order>;
}

/**
 * Perpetual Broker Interface
 *
 * @author Yepeng Ding
 */
export interface PerpBroker extends Broker {
  placeMarketLong(pair: Pair, size: number): Promise<Order>;

  placeMarketShort(pair: Pair, size: number): Promise<Order>;

  placeLimitLong(pair: Pair, size: number, price: number): Promise<Order>;

  placeLimitShort(pair: Pair, size: number, price: number): Promise<Order>;

  placeGTXLong(pair: Pair, size: number, price: number): Promise<Order>;

  placeGTXShort(pair: Pair, size: number, price: number): Promise<Order>;

  placeStopMarketLong(pair: Pair, size: number, price: number): Promise<Order>;

  placeStopMarketShort(pair: Pair, size: number, price: number): Promise<Order>;

  getPosition(pair: Pair): Promise<Position | null>;
}

export interface Position {
  entryPrice: number;
  side: TradeSide;
  size: number;
  unrealizedPnL?: number;
  liquidationPrice?: number;
}

import { Order } from './market.interface';
import { Interval } from '../types';
import { TradeSide } from '../constants';
import { KLines } from '../structures/klines';
import { Currency, Pair } from '../structures/pair';

export interface Broker {
  cancelOrder(id: string, pair: Pair): Promise<boolean>;

  cancelConditionalOrder(id: string, pair: Pair): Promise<boolean>;

  cancelOrders(ids: string[], pair: Pair): Promise<boolean>;

  cancelConditionalOrders(ids: string[], pair: Pair): Promise<boolean>;

  getBalance(currency: Currency): Promise<number | null>;

  getMarketPrice(pair: Pair): Promise<number | null>;

  getKLines(pair: Pair, interval: Interval, limit?: number): Promise<KLines>;

  getBestBid(pair: Pair): Promise<number | null>;

  getBestAsk(pair: Pair): Promise<number | null>;

  getOpenOrders(pair: Pair): Promise<Order[]>;

  getOpenConditionalOrders(pair: Pair): Promise<Order[]>;

  getOrder(id: string, pair: Pair, logRaw?: boolean): Promise<Order | null>;
}

/**
 * Spot Broker Interface
 *
 * @author Yepeng Ding
 */
export interface SpotBroker extends Broker {
  placeMarketBuy(pair: Pair, size: number): Promise<Order | null>;

  placeMarketSell(pair: Pair, size: number): Promise<Order | null>;

  placeLimitBuy(pair: Pair, size: number, price: number): Promise<Order | null>;

  placeLimitSell(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order | null>;

  placeGTXBuy(pair: Pair, size: number, price: number): Promise<Order | null>;

  placeGTXSell(pair: Pair, size: number, price: number): Promise<Order | null>;

  placeStopMarketBuy(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order | null>;

  placeStopMarketSell(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order | null>;
}

/**
 * Perpetual Broker Interface
 *
 * @author Yepeng Ding
 */
export interface PerpBroker extends Broker {
  placeMarketLong(pair: Pair, size: number): Promise<Order | null>;

  placeMarketShort(pair: Pair, size: number): Promise<Order | null>;

  placeLimitLong(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order | null>;

  placeLimitShort(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order | null>;

  placeGTXLong(pair: Pair, size: number, price: number): Promise<Order | null>;

  placeGTXShort(pair: Pair, size: number, price: number): Promise<Order | null>;

  placeStopMarketLong(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order | null>;

  placeStopMarketShort(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order | null>;

  getPosition(pair: Pair): Promise<Position | null>;
}

export interface Position {
  entryPrice: number;
  side: TradeSide;
  size: number;
  unrealizedPnL?: number;
  liquidationPrice?: number;
}

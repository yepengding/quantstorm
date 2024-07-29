import { Broker } from '../../core/interfaces/broker.interface';
import { Order } from '../../core/interfaces/market.interface';
import { Pair } from '../../core/structures/pair';

/**
 * Binance Broker
 *
 * @author Yepeng Ding
 */
export interface BinanceBroker extends Broker {
  getOrders(pair: Pair): Promise<Order[]>;
}

export interface BinanceConfig {
  apiKey: string;
  secret: string;
}

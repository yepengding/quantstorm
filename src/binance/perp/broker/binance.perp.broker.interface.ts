import { Broker } from '../../../core/interfaces/broker.interface';
import { Order } from '../../../core/interfaces/market.interface';
import { PerpetualPair } from '../../../core/structures/pair';

/**
 * Binance Broker
 *
 * @author Yepeng Ding
 */
export interface BinancePerpBroker extends Broker {
  getOrders(pair: PerpetualPair): Promise<Order[]>;
}

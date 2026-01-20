import { Broker } from '../../../core/interfaces/broker.interface';
import { Order } from '../../../core/interfaces/market.interface';
import { BasePair } from '../../../core/structures/pair';

/**
 * Binance Spot Broker Interface
 *
 * @author Yepeng Ding
 */
export interface BinanceSpotBroker extends Broker {
  getOrders(pair: BasePair): Promise<Order[]>;
}

import { Order } from '../../../core/interfaces/market.interface';
import { BasePair } from '../../../core/structures/pair';
import { PerpBroker } from '../../../core/interfaces/broker.interface';

/**
 * Binance Spot Broker Interface
 *
 * @author Yepeng Ding
 */
export interface BinanceSpotBroker extends PerpBroker {
  getOrders(pair: BasePair): Promise<Order[]>;
}

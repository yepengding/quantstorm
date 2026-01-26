import { OptionBroker } from '../../../core/interfaces/broker.interface';
import { OptionPair } from '../../../core/structures/pair';
import { Order } from '../../../core/interfaces/market.interface';

/**
 * Binance Option Broker Interface
 *
 * @author Yepeng Ding
 */
export interface BinanceOptionBroker extends OptionBroker {
  getOrders(pair: OptionPair): Promise<Order[]>;
}

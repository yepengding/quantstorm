import { Order } from '../../../core/interfaces/market.interface';
import { BasePair } from '../../../core/structures/pair';
import { SpotBroker } from '../../../core/interfaces/broker.interface';

/**
 * Binance Spot Broker Interface
 *
 * @author Yepeng Ding
 */
export interface BinanceSpotBroker extends SpotBroker {
  getOrders(pair: BasePair): Promise<Order[]>;
  subscribeRWUSD(amount: number): Promise<void>;
  redeemRWUSD(amount: number, type?: 'FAST' | 'STANDARD'): Promise<void>;
}

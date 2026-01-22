import { Order } from '../../../core/interfaces/market.interface';
import { BasePair, Currency } from '../../../core/structures/pair';
import { SpotBroker } from '../../../core/interfaces/broker.interface';

/**
 * Binance Spot Broker Interface
 *
 * @author Yepeng Ding
 */
export interface BinanceSpotBroker extends SpotBroker {
  getOrders(pair: BasePair): Promise<Order[]>;
  getSimpleEarnFlexibleBalance(currency: Currency): Promise<number | null>;
  subscribeRWUSD(amount: number): Promise<void>;
  redeemRWUSD(amount: number, type?: 'FAST' | 'STANDARD'): Promise<void>;
}

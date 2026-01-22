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
  /**
   * Get earn flexible balance.
   * Update cache for earn flexible products
   *
   * @param currencies
   */
  getEarnFlexibleBalance(
    currencies: Currency[],
  ): Promise<Map<Currency, number>>;

  /**
   * Redeem earn flexible.
   * Redeem all if amount is not specified.
   *
   * @param currency
   * @param amount
   */
  redeemEarnFlexible(currency: Currency, amount?: number): Promise<void>;
  subscribeRWUSD(amount: number): Promise<void>;
  redeemRWUSD(amount: number, type?: 'FAST' | 'STANDARD'): Promise<void>;
}

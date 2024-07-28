import { Broker } from '../../core/interfaces/broker.interface';
import { Interval } from '../../core/types';
import { Order } from '../../core/interfaces/market.interface';
import { Currency } from '../../core/constants';

/**
 * Backtest Broker
 *
 * @author Yepeng Ding
 */
export interface BacktestBroker extends Broker {
  /**
   * Set balance of a currency
   * @param currency
   * @param amount
   */
  setBalance(currency: Currency, amount: number): void;

  // Clock in timestamp
  clock: number;

  /**
   * Initialize clock and interval
   * @param clock
   * @param interval
   */
  initClockAndInterval(clock: number, interval: Interval): void;

  /**
   * Update clock to next timestamp based on the interval
   */
  nextClock(): void;

  // Order history
  orderHistory: Order[][];
}

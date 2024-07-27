import { Broker } from '../../core/interfaces/broker.interface';
import { Interval } from '../../core/types';
import { TradeSide } from '../../core/constants';
import { Order } from "../../core/interfaces/market.interface";

/**
 * Backtest Broker
 *
 * @author Yepeng Ding
 */
export interface BacktestBroker extends Broker {
  /**
   * Set balance of a symbol
   * @param symbol
   * @param amount
   */
  setBalance(symbol: string, amount: number): void;

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

  /**
   * Get order history string
   */
  getOrderHistoryString(): string;

  /**
   * Get balance history
   */
  getBalanceHistory(currency: string): number[];
}

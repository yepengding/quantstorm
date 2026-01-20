import { PerpBroker } from '../../../core/interfaces/broker.interface';
import { Interval } from '../../../core/types';
import { Currency } from '../../../core/constants';
import { BacktestResult } from '../../../backtest/structures/result';

export interface BacktestBroker {
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
  nextClock(): Promise<void>;

  // Backtesting result
  backtestResult: BacktestResult;
}

/**
 * Backtest Perpetual Broker
 *
 * @author Yepeng Ding
 */
export interface BacktestPerpBroker extends BacktestBroker, PerpBroker {}

import { BacktestResult } from '../../backtest/structures/result';
import { Interval } from '../../core/types';
import { Currency } from '../../core/constants';

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

export interface FeederConfig {
  dataCacheSize: number;
  dataPath: string;
}

export interface BacktestConfig {
  tick: number;
  commission: {
    maker: number;
    taker: number;
  };
  feeder: FeederConfig;
}

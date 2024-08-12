import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { Interval } from '../core/types';
import { BacktestHistory } from './structures/history';
import { Currency } from '../core/constants';
import { BacktestBroker } from './broker/backtest.broker.interface';

/**
 * Backtest Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestService {
  constructor() {}

  public async run(
    strategy: StrategyAbstract,
    strategyArgs: string,
    startTimestamp: number,
    endTimestamp: number,
    executionInterval: Interval,
  ): Promise<BacktestHistory> {
    // Initialize the balance
    this.initBalance(strategy.backtestBroker);

    // Initialize the clock to the start timestamp
    strategy.backtestBroker.initClockAndInterval(
      startTimestamp,
      executionInterval,
    );

    // Initialize strategy
    await strategy.init(strategyArgs);

    // Continue executing strategy until reaching the end time
    while (strategy.backtestBroker.clock < endTimestamp) {
      // Execute the strategy
      await strategy.next();

      // Update clock
      await strategy.backtestBroker.nextClock();
    }

    return {
      tradeOrderHistory: strategy.backtestBroker.tradeOrderHistory,
      balanceHistory: strategy.backtestBroker.balanceHistory,
    };
  }

  private initBalance(backtestBroker: BacktestBroker) {
    for (const currency of Object.keys(Currency)) {
      backtestBroker.setBalance(currency as Currency, 1000);
    }
  }
}

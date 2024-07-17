import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { Interval } from '../core/types';

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
    startTimestamp: number,
    endTimestamp: number,
    executionInterval: Interval,
  ) {
    // Initialize the balance
    strategy.backtestBroker.setBalance('USDT', 1000);

    // Initialize the clock to the start timestamp
    strategy.backtestBroker.initClockAndInterval(
      startTimestamp,
      executionInterval,
    );

    // Initialize strategy
    await strategy.init();

    // Continue executing strategy until reaching the end time
    while (strategy.backtestBroker.clock < endTimestamp) {
      // Execute the strategy
      await strategy.next();

      // Update clock
      strategy.backtestBroker.nextClock();
    }
  }
}

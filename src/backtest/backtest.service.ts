import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { Interval } from '../core/types';
import { BacktestResult } from './structures/result';

import { ConfigService } from '@nestjs/config';
import { BacktestConfig } from '../broker/backtest/backtest.interface';
import { toTimestampInterval } from './backtest.utils';

/**
 * Backtest Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestService {
  private currentClock: number;
  private clockInterval: number;

  constructor(private readonly configService: ConfigService) {}

  public async run(
    strategy: StrategyAbstract,
    strategyArgs: string,
    startTimestamp: number,
    endTimestamp: number,
    executionInterval: Interval,
  ): Promise<ReadonlyArray<BacktestResult>> {
    // Set strategy backtest config
    strategy.setBacktestConfig(
      this.configService.get<BacktestConfig>('backtest'),
      startTimestamp,
      executionInterval,
    );

    // Initialize backtest clock and interval
    this.currentClock = startTimestamp;
    this.clockInterval = toTimestampInterval(executionInterval);

    // Initialize strategy
    await strategy.init(strategyArgs);

    // Continue executing strategy until reaching the end time
    while (this.currentClock < endTimestamp) {
      // Execute the strategy
      await strategy.next();

      // Update clock
      this.currentClock += this.clockInterval;
      // Update clock for all backtest brokers
      for (const backtestBroker of strategy.backtestBrokers) {
        await backtestBroker.nextClock();
      }
    }

    return strategy.backtestBrokers.map((b) => b.backtestResult);
  }
}

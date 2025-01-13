import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { Interval } from '../core/types';
import { Currency } from '../core/constants';
import { BacktestResult } from './structures/result';
import { BacktestBrokerService } from '../broker/backtest/backtest.broker.service';
import {
  BacktestBroker,
  BacktestConfig,
} from '../broker/backtest/backtest.broker.interface';
import { ConfigService } from '@nestjs/config';

/**
 * Backtest Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestService {
  constructor(private readonly configService: ConfigService) {}

  public async run(
    strategy: StrategyAbstract,
    strategyArgs: string,
    startTimestamp: number,
    endTimestamp: number,
    executionInterval: Interval,
  ): Promise<BacktestResult> {
    strategy.setBacktestBroker(
      new BacktestBrokerService(
        this.configService.get<BacktestConfig>('backtest'),
      ),
    );

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

    return strategy.backtestBroker.backtestResult;
  }

  private initBalance(backtestBroker: BacktestBroker) {
    for (const currency of Object.keys(Currency)) {
      backtestBroker.setBalance(currency as Currency, 1000);
    }
  }
}

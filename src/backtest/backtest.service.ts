import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { Interval } from '../core/types';
import { Order } from '../core/interfaces/market.interface';
import { TradeSide } from '../core/constants';
import { or } from 'mathjs';

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

    console.log(strategy.backtestBroker.getOrderHistoryString());

    const balanceHistory = strategy.backtestBroker.getBalanceHistory('USDT');
    console.log(`Max balance: ${Math.max(...balanceHistory)}`);
    console.log(`Min balance: ${Math.min(...balanceHistory)}`);
  }
}

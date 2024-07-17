import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { BacktestDataService } from './data/backtest.data.service';
import { toTimestampInterval } from './backtest.utils';
import { Interval } from '../core/types';
import { DEFAULT_KLINE_LIMIT } from '../core/constants';

/**
 * Backtest Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestService {
  constructor(private readonly data: BacktestDataService) {}

  public async run(
    strategy: StrategyAbstract,
    symbol: string,
    startTimestamp: number,
    endTimestamp: number,
    executionInterval: Interval,
  ) {
    // Feed K-lines at the start timestamp into the backtest broker of the strategy
    strategy.backtestBroker.setKLines(
      symbol,
      await this.data.getKLinesInBinanceCSV(
        startTimestamp,
        DEFAULT_KLINE_LIMIT,
      ),
    );

    // Initialize strategy
    await strategy.init();

    const interval = toTimestampInterval(executionInterval);
    for (let clock = startTimestamp; clock < endTimestamp; clock += interval) {
      // Feed K-lines into the backtest broker of the strategy
      strategy.backtestBroker.setKLines(
        symbol,
        await this.data.getKLinesInBinanceCSV(clock, DEFAULT_KLINE_LIMIT),
      );
      // Execute the strategy
      await strategy.next();
    }
  }
}

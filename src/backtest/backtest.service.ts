import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { BacktestDataService } from './data/backtest.data.service';

@Injectable()
export class BacktestService {
  constructor(private readonly data: BacktestDataService) {}

  public async run(strategy: StrategyAbstract) {
    // Initialize strategy
    strategy.init();

    // Feed K-lines in Binance CSV to the strategy
    await this.data.feedKLinesInBinanceCSVTo(strategy);
  }
}

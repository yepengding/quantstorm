import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { BacktestDataService } from './data/backtest.data.service';

@Injectable()
export class BacktestService {
  private clock: number;

  constructor(private readonly data: BacktestDataService) {}

  public async run(strategy: StrategyAbstract, startTimestamp: number) {
    // Set clock
    this.clock = startTimestamp;

    // Initialize strategy
    strategy.init();

    // Get K-lines
    await this.data.getKLinesInBinanceCSV(this.clock, 100);
  }
}

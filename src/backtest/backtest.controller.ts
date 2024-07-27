import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { Interval, StrategyRegistryType } from '../core/types';
import { BacktestService } from './backtest.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { KLine } from '../core/interfaces/market.interface';
import { ChartKLine } from './backtest.interface';

/**
 * Backtest Controller
 * @author Yepeng Ding
 */
@Controller('backtest')
export class BacktestController {
  constructor(
    private readonly broker: BacktestBrokerService,
    private readonly backtest: BacktestService,
    private readonly feeder: BacktestFeederService,
    @Inject('STRATEGY_REGISTRY')
    private readonly registry: StrategyRegistryType,
  ) {}

  @Get(':name')
  @Render('index')
  async index(
    @Param('name') name: string,
    @Query('start', ParseIntPipe) start: number,
    @Query('end', ParseIntPipe) end: number,
    @Query('interval') interval: Interval,
    @Query('symbol') symbol: string,
  ) {
    const strategyClass = this.registry.get(name.toLowerCase());
    let result = `Cannot find strategy ${name}`;

    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      await this.backtest.run(strategy, start, end, interval);
      result = `Running ${name}`;
    }

    const kLines = this.toCharKLines(
      await this.feeder.getKLinesInBinanceCSV(symbol, interval, end),
    );
    return {
      kLines: JSON.stringify(kLines),
    };
  }

  private toCharKLines(kLines: KLine[]): ChartKLine[] {
    return kLines.map((k) => {
      return {
        x: k.timestamp * 1000,
        o: k.open,
        h: k.high,
        l: k.low,
        c: k.close,
      };
    });
  }
}

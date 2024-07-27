import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  Render,
} from '@nestjs/common';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { Interval, StrategyRegistryType } from '../core/types';
import { BacktestService } from './backtest.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { toCharKLines, toChartOrders } from './backtest.view';
import { ChartOrders } from './backtest.view.type';

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

    let chartOrders: ChartOrders = {
      long: [],
      short: [],
    };

    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      const history = await this.backtest.run(strategy, start, end, interval);
      chartOrders = toChartOrders(history.orderHistory);
    }

    const chartKLines = toCharKLines(
      await this.feeder.getKLinesInBinanceCSV(symbol, interval, end),
    );
    return {
      name: name,
      symbol: symbol,
      kLines: JSON.stringify(chartKLines),
      longOrders: JSON.stringify(chartOrders.long),
      shortOrders: JSON.stringify(chartOrders.short),
    };
  }
}

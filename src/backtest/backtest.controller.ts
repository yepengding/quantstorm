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
import { toCharKLines, toChartBalance, toChartOrders } from './backtest.view';
import { ChartBalances, ChartOrders } from './backtest.view.type';
import { toPair } from '../core/utils';

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
    const quote = toPair(symbol).quote;
    let chartOrders: ChartOrders = {
      long: [],
      short: [],
    };
    let chartBalances: ChartBalances = [];
    const strategyClass = this.registry.get(name.toLowerCase());
    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      const history = await this.backtest.run(strategy, start, end, interval);
      chartOrders = toChartOrders(history.orderHistory);
      chartBalances = toChartBalance(history.balanceHistory.get(quote));
    }

    const chartKLines = toCharKLines(
      await this.feeder.getKLinesInBinanceCSV(symbol, interval, end),
    );
    return {
      name: name,
      symbol: symbol,
      kLines: JSON.stringify(chartKLines),
      balances: JSON.stringify(chartBalances),
      longOrders: JSON.stringify(chartOrders.long),
      shortOrders: JSON.stringify(chartOrders.short),
      minBalance: 0,
      maxBalance: 0,
    };
  }
}

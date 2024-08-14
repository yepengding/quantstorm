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
import { Interval } from '../core/types';
import { BacktestService } from './backtest.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import {
  toCharKLines,
  toChartBalance,
  toChartOrders,
  toOrderHistoryText,
} from './backtest.view';
import { ChartBalances, ChartOrders } from './backtest.view.type';
import { BasePair } from '../core/structures/pair';
import { StrategyRegistryType } from '../strategy/strategy.types';

/**
 * Backtest Controller
 *
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

  @Get('/strategy/:name')
  @Render('index.hbs')
  async backtestStrategy(
    @Param('name') name: string,
    @Query('start', ParseIntPipe) start: number,
    @Query('end', ParseIntPipe) end: number,
    @Query('interval') interval: Interval,
    @Query('base') base: string,
    @Query('quote') quote: string,
    @Query('args') args: string,
  ) {
    const pair = new BasePair(base, quote);
    let chartBalances: ChartBalances = [];
    let chartOrders: ChartOrders = {
      long: [],
      short: [],
    };
    let orderHistoryText: string[] = [];
    const strategyClass = this.registry.get(name);
    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      const result = await this.backtest.run(
        strategy,
        args,
        start,
        end,
        interval,
      );
      chartBalances = toChartBalance(result.getBalanceRecords(pair.quote));
      chartOrders = toChartOrders(result.filledOrderRecords);
      orderHistoryText = toOrderHistoryText(result.filledOrderRecords);
    } else {
      name = `${name} (Unknown)`;
    }
    const chartKLines = toCharKLines(
      await this.feeder.getBinanceKLines(
        pair,
        interval,
        end,
        chartBalances.length,
      ),
    );
    return {
      name: name,
      symbol: pair.toSymbol(),
      kLines: JSON.stringify(chartKLines),
      balances: JSON.stringify(chartBalances),
      longOrders: JSON.stringify(chartOrders.long),
      shortOrders: JSON.stringify(chartOrders.short),
      orderHistoryText: orderHistoryText,
    };
  }

  @Get('/build/kline')
  async buildData(
    @Query('base') base: string,
    @Query('quote') quote: string,
    @Query('interval') interval: Interval,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const pathToDataFile = await this.feeder.buildBinanceKLineData(
      new BasePair(base, quote),
      interval,
      start,
      end,
    );
    return `Build ${pathToDataFile}`;
  }
}

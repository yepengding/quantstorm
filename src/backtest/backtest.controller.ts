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
import {
  toCharKLines,
  toChartBalance,
  toChartOrders,
  toOrderHistoryText,
} from './backtest.view';
import { ChartBalances, ChartOrders } from './backtest.view.type';
import { Pair } from '../core/structures/pair';
import { ZoneRecoveryBB } from "../strategy/zone_recovery_bb/zone_recovery_bb";

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
  ) {
    const pair = new Pair(base, quote);
    let chartBalances: ChartBalances = [];
    let chartOrders: ChartOrders = {
      long: [],
      short: [],
    };
    let orderHistoryText: string[] = [];
    const strategyClass = this.registry.get(name);
    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      const history = await this.backtest.run(strategy, start, end, interval);
      chartBalances = toChartBalance(history.balanceHistory.get(pair.quote));
      chartOrders = toChartOrders(history.tradeOrderHistory);
      orderHistoryText = toOrderHistoryText(history.tradeOrderHistory);
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
      new Pair(base, quote),
      interval,
      start,
      end,
    );
    return `Build ${pathToDataFile}`;
  }
}

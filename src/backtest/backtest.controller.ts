import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  Render,
} from '@nestjs/common';
import { Interval } from '../core/types';
import { BacktestService } from './backtest.service';
import {
  toCharKLines,
  toChartBalance,
  toChartTrades,
  toOrderHistoryText,
} from './backtest.view';
import { ChartBalances, ChartTrades } from './backtest.view.type';
import { BasePair } from '../core/structures/pair';
import { StrategyRegistryType } from '../strategy/strategy.types';
import { InjectRepository } from '@nestjs/typeorm';
import { StrategyState } from '../executor/executor.dao';
import { Repository } from 'typeorm';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { ConfigService } from '@nestjs/config';
import { FeederConfig } from '../broker/backtest/backtest.broker.interface';

/**
 * Backtest Controller
 *
 * @author Yepeng Ding
 */
@Controller('backtest')
export class BacktestController {
  private readonly feeder: BacktestFeederService;

  constructor(
    private readonly configService: ConfigService,
    private readonly backtest: BacktestService,
    @Inject('STRATEGY_REGISTRY')
    private readonly registry: StrategyRegistryType,
    @InjectRepository(StrategyState)
    private stateRepository: Repository<StrategyState>,
  ) {
    this.feeder = new BacktestFeederService(
      this.configService.get<FeederConfig>('backtest.feeder'),
    );
  }

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
    let chartTrades: ChartTrades = {
      long: [],
      short: [],
    };
    let orderHistoryText: string[] = [];
    const strategyClass = this.registry.get(name);
    if (strategyClass) {
      const strategy = new strategyClass('backtest', this.stateRepository);
      const result = await this.backtest.run(
        strategy,
        args,
        start,
        end,
        interval,
      );
      chartBalances = toChartBalance(result.getBalanceRecords(pair.quote));
      chartTrades = toChartTrades(result.tradeRecords);
      orderHistoryText = toOrderHistoryText(result.tradeRecords);
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
      longOrders: JSON.stringify(chartTrades.long),
      shortOrders: JSON.stringify(chartTrades.short),
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

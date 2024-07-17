import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { Interval, StrategyRegistryType } from '../core/types';
import { BacktestService } from './backtest.service';

/**
 * Backtest Controller
 * @author Yepeng Ding
 */
@Controller('backtest')
export class BacktestController {
  constructor(
    private readonly broker: BacktestBrokerService,
    private readonly backtest: BacktestService,
    @Inject('STRATEGY_REGISTRY')
    private readonly registry: StrategyRegistryType,
  ) {}

  @Get(':name')
  async index(
    @Param('name') name: string,
    @Query('start', ParseIntPipe) start: number,
    @Query('end', ParseIntPipe) end: number,
    @Query('interval') interval: Interval,
  ): Promise<string> {
    const strategyClass = this.registry.get(name.toLowerCase());
    let result = `Cannot find strategy ${name}`;

    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      await this.backtest.run(strategy, start, end, interval);
      result = `Running ${name}`;
    }

    return result;
  }
}

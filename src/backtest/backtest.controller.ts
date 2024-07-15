import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { StrategyRegistryType } from '../core/types';
import { BacktestService } from './backtest.service';

/**
 * Backtest Controller
 * @author Yepeng Ding
 */
@Controller('backtest')
export class BacktestController {
  constructor(
    private readonly configService: ConfigService,
    private readonly broker: BacktestBrokerService,
    private readonly backtest: BacktestService,
    @Inject('STRATEGY_REGISTRY')
    private readonly registry: StrategyRegistryType,
  ) {}

  @Get()
  async index(): Promise<string> {
    const strategyName = this.configService.get<string>('strategy');
    const strategyClass = this.registry.get(strategyName);
    let result = `Cannot find strategy ${strategyName}`;
    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      await this.backtest.run(strategy);
      result = `Running ${strategyName}`;
    }

    return result;
  }
}

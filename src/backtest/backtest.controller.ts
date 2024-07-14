import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { StrategyRegistryType } from '../core/types';

/**
 * Backtest Controller
 * @author Yepeng Ding
 */
@Controller('backtest')
export class BacktestController {
  constructor(
    private readonly configService: ConfigService,
    private readonly broker: BacktestBrokerService,
    @Inject('STRATEGY_REGISTRY')
    private readonly registry: StrategyRegistryType,
  ) {}

  @Get()
  index(): string {
    const strategyName = this.configService.get<string>('STRATEGY');
    const strategyClass = this.registry.get(strategyName);
    let result = `Cannot find strategy ${strategyName}`;
    if (strategyClass) {
      const strategy = new strategyClass(this.broker);
      strategy.init();
      strategy.next();
      result = `Running ${strategyName}`;
    }

    return result;
  }
}

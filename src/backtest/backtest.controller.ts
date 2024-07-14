import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StrategyRegistryService } from '../strategy/strategy.registry.service';
import { BacktestBrokerService } from './backtest.broker.service';

@Controller('backtest')
export class BacktestController {
  constructor(
    private readonly configService: ConfigService,
    private readonly broker: BacktestBrokerService,
    private readonly strategyRegistry: StrategyRegistryService,
  ) {}

  @Get()
  index(): string {
    const strategyName = this.configService.get<string>('STRATEGY');
    const strategyClass = this.strategyRegistry.getStrategy(strategyName);
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

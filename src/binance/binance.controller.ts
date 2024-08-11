import { Controller, Get, Inject, Param } from '@nestjs/common';
import { BinancePerpService } from './perp/binance.perp.service';
import { StrategyRegistryType } from '../strategy/strategy.types';

/**
 * Binance Strategy Execution Controller
 *
 * @author Yepeng Ding
 */
@Controller('binance')
export class BinanceController {
  constructor(
    private readonly binancePerpService: BinancePerpService,
    @Inject('STRATEGY_REGISTRY')
    private readonly strategyRegistry: StrategyRegistryType,
  ) {}

  @Get('/perp/execute/:name')
  async executePerp(@Param('name') name: string) {
    const strategyClass = this.strategyRegistry.get(name);
    if (strategyClass) {
      if (this.binancePerpService.isRunning(name)) {
        return `Strategy ${name} has been running`;
      }

      await this.binancePerpService.run(strategyClass);
      return `Start executing ${name}`;
    } else {
      return `Strategy ${name} not found`;
    }
  }

  @Get('/perp/stop/:name')
  async stop(@Param('name') name: string) {
    if (this.binancePerpService.stop(name)) {
      return `Strategy ${name} has stopped`;
    } else {
      return `Failed to stop ${name}. ${name} may not exist`;
    }
  }
}

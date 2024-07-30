import { Controller, Get, Inject, Param } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { StrategyRegistryType } from '../core/types';
import { BinanceBrokerService } from './broker/binance.broker.service';

/**
 * Binance Trading Controller
 *
 * @author Yepeng Ding
 */
@Controller('binance')
export class BinanceController {
  constructor(
    private readonly binanceService: BinanceService,
    private readonly broker: BinanceBrokerService,
    @Inject('STRATEGY_REGISTRY')
    private readonly strategyRegistry: StrategyRegistryType,
  ) {}

  @Get('/execute/:name')
  async execute(@Param('name') name: string) {
    const strategyClass = this.strategyRegistry.get(name.toLowerCase());
    if (strategyClass) {
      if (this.binanceService.isRunning(name)) {
        return `Strategy ${name} has been running`;
      }

      const strategy = new strategyClass(this.broker);
      await this.binanceService.run(strategy);
      return `Start executing ${name}`;
    } else {
      return `Strategy ${name} not found`;
    }
  }

  @Get('/stop/:name')
  async stop(@Param('name') name: string) {
    if (this.binanceService.stop(name)) {
      return `Strategy ${name} has stopped`;
    } else {
      return `Failed to stop ${name}. ${name} may not exist`;
    }
  }
}

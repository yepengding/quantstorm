import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
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

  @Get('/perp/execute/:name/:id')
  async executePerp(
    @Param('name') name: string,
    @Param('id') id: string,
    @Query('args') args: string,
  ) {
    if (!id || id.length == 0) {
      return 'ID cannot be empty';
    }
    const strategyClass = this.strategyRegistry.get(name);
    if (strategyClass) {
      if (this.binancePerpService.isRunning(id)) {
        return `Strategy ${id} has been running`;
      }
      try {
        const isRunning = await this.binancePerpService.run(
          id,
          strategyClass,
          args,
        );
        if (!isRunning) {
          return `Failed to execute ${id} (${name})`;
        }
      } catch {
        return `Failed to execute ${id} (${name})`;
      }
      return `Start executing ${id} (${name})`;
    } else {
      return `Strategy ${name} for ${id} not found`;
    }
  }

  @Get('/perp/stop/:id')
  async stop(@Param('id') id: string) {
    if (this.binancePerpService.stop(id)) {
      return `Strategy ${id} has stopped`;
    } else {
      return `Failed to stop ${id}. ${id} may not exist`;
    }
  }
}

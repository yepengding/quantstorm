import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { StrategyRegistryType } from '../strategy/strategy.types';
import { BitgetPerpService } from './perp/bitget.perp.service';

/**
 * Bitget Strategy Execution Controller
 *
 * @author Yepeng Ding
 */
@Controller('bitget')
export class BitgetController {
  constructor(
    private readonly bitgetPerpService: BitgetPerpService,
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
      if (this.bitgetPerpService.isRunning(id)) {
        return `Strategy ${id} has been running`;
      }
      try {
        const isRunning = await this.bitgetPerpService.run(
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
    if (this.bitgetPerpService.stop(id)) {
      return `Strategy ${id} has stopped`;
    } else {
      return `Failed to stop ${id}. ${id} may not exist`;
    }
  }
}

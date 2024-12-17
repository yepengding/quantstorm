import { Controller, Get, Inject, Logger, Param, Query } from '@nestjs/common';
import { StrategyRegistryType } from '../strategy/strategy.types';
import { ExecutorService } from './executor.service';

/**
 * Strategy Execution Controller
 *
 * @author Yepeng Ding
 */
@Controller('executor')
export class ExecutorController {
  private readonly logger = new Logger(ExecutorController.name);

  constructor(
    private readonly executorService: ExecutorService,
    @Inject('STRATEGY_REGISTRY')
    private readonly strategyRegistry: StrategyRegistryType,
  ) {}

  @Get('/execute/:name/:id')
  async execute(
    @Param('name') name: string,
    @Param('id') id: string,
    @Query('args') args: string,
  ) {
    if (!id || id.length == 0) {
      return 'ID cannot be empty';
    }
    const strategyClass = this.strategyRegistry.get(name);
    if (!!strategyClass) {
      if (this.executorService.isRunning(id)) {
        return `Strategy ${id} has been running`;
      }
      try {
        const isRunning = await this.executorService.run(
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
      this.logger.log(`Start executing ${id} (${name})`);
      return `Start executing ${id} (${name})`;
    } else {
      return `Strategy ${name} for ${id} not found`;
    }
  }

  @Get('/stop/:id')
  async stop(@Param('id') id: string) {
    if (this.executorService.stop(id)) {
      this.logger.log(`Strategy ${id} has stopped`);
      return `Strategy ${id} has stopped`;
    } else {
      return `Failed to stop ${id}. ${id} may not exist`;
    }
  }
}

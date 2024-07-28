import { Controller, Get, Inject, Param } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { BinanceService } from './binance.service';
import { CronJob } from 'cron';
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
    private schedulerRegistry: SchedulerRegistry,
    private readonly binanceService: BinanceService,
    private readonly broker: BinanceBrokerService,
    @Inject('STRATEGY_REGISTRY')
    private readonly strategyRegistry: StrategyRegistryType,
  ) {}

  @Get('/execute/:name')
  async execute(@Param('name') name: string) {
    const strategyClass = this.strategyRegistry.get(name.toLowerCase());
    if (strategyClass) {
      let runningJob: CronJob;
      try {
        runningJob = this.schedulerRegistry.getCronJob(name);
      } catch (e) {
        runningJob = null;
      }
      if (runningJob && runningJob.running) {
        return `Strategy ${name} is executing`;
      }

      const strategy = new strategyClass(this.broker);
      await this.binanceService.run(strategy);
      return 'Executing Binance trading';
    } else {
      return `Strategy ${name} not found`;
    }
  }

  @Get('/stop/:name')
  async stop(@Param('name') name: string) {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(name);
    } catch (e) {
      runningJob = null;
    }
    if (!runningJob) {
      return `No executing strategy ${name}`;
    } else if (runningJob.running) {
      runningJob.stop();
      this.schedulerRegistry.deleteCronJob(name);
      return `Stopped strategy ${name}`;
    } else {
      this.schedulerRegistry.deleteCronJob(name);
      return `Strategy ${name} has stopped`;
    }
  }
}

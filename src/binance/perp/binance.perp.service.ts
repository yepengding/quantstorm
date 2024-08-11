import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { BinancePerpBrokerService } from './broker/binance.perp.broker.service';
import { StrategyClass } from '../../strategy/strategy.types';

/**
 * Binance Perpetual Strategy Execution Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinancePerpService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly broker: BinancePerpBrokerService,
  ) {}

  async run(strategyClass: StrategyClass) {
    // Instantiate strategy
    const strategy = new strategyClass(this.broker);

    // Initialize strategy
    await strategy.init();

    // Schedule strategy execution
    const job = new CronJob(CronExpression.EVERY_5_SECONDS, async () => {
      await strategy.next();
    });
    this.schedulerRegistry.addCronJob(this.getJobName(strategy.name), job);
    job.start();
  }

  stop(strategyName: string) {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(
        this.getJobName(strategyName),
      );
    } catch (e) {
      runningJob = null;
    }
    if (!runningJob) {
      return false;
    } else if (runningJob.running) {
      runningJob.stop();
      this.schedulerRegistry.deleteCronJob(this.getJobName(strategyName));
      return true;
    } else {
      this.schedulerRegistry.deleteCronJob(this.getJobName(strategyName));
      return true;
    }
  }

  isRunning(strategyName: string): boolean {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(
        this.getJobName(strategyName),
      );
    } catch (e) {
      runningJob = null;
    }
    return runningJob ? runningJob.running : false;
  }

  private getJobName(strategyName: string): string {
    return `${BinancePerpService.name}${strategyName}`;
  }
}

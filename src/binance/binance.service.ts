import { Injectable } from '@nestjs/common';
import { StrategyAbstract } from '../strategy/strategy.abstract';
import { CronJob } from 'cron';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';

/**
 * Binance Trading Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinanceService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  async run(strategy: StrategyAbstract) {
    // Initialize strategy
    await strategy.init();

    // Schedule strategy execution
    const job = new CronJob(CronExpression.EVERY_5_SECONDS, async () => {
      await strategy.next();
    });
    this.schedulerRegistry.addCronJob(strategy.name, job);
    job.start();
  }

  stop(strategyName: string) {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(strategyName);
    } catch (e) {
      runningJob = null;
    }
    if (!runningJob) {
      return false;
    } else if (runningJob.running) {
      runningJob.stop();
      this.schedulerRegistry.deleteCronJob(strategyName);
      return true;
    } else {
      this.schedulerRegistry.deleteCronJob(strategyName);
      return true;
    }
  }

  isRunning(strategyName: string): boolean {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(strategyName);
    } catch (e) {
      runningJob = null;
    }
    return runningJob ? runningJob.running : false;
  }
}

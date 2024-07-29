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
    const job = new CronJob(CronExpression.EVERY_10_SECONDS, async () => {
      await strategy.next();
    });
    this.schedulerRegistry.addCronJob(strategy.name, job);
    job.start();
  }
}

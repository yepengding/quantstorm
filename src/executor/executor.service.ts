import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StrategyState } from '../strategy/strategy.dao';
import { StrategyClass } from '../strategy/strategy.types';

/**
 * Strategy Execution Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);

  private counter: number;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(StrategyState)
    private stateRepository: Repository<StrategyState>,
  ) {
    this.counter = 0;
  }

  async run(
    strategyId: string,
    strategyClass: StrategyClass,
    strategyArgs: string,
  ): Promise<boolean> {
    // Instantiate strategy
    const strategy = new strategyClass(strategyId, this.stateRepository);

    // Initialize strategy
    try {
      await strategy.init(strategyArgs);
    } catch (e) {
      this.logger.error(`${strategyId} crashed during initialization`);
      this.logger.error(e.toString());
      return false;
    }

    // Schedule strategy execution
    this.counter = this.counter > 58 ? 0 : this.counter + 1;
    const job = new CronJob(`${this.counter}-59/5 * * * * *`, async () => {
      try {
        await strategy.next();
      } catch (e) {
        this.logger.error(e);
        this.logger.error(`${strategyId} crashed`);
        return;
      }
    });
    this.schedulerRegistry.addCronJob(strategyId, job);
    job.start();
    return true;
  }

  stop(strategyId: string) {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(strategyId);
    } catch (e) {
      runningJob = null;
    }
    if (!runningJob) {
      return false;
    } else if (runningJob.running) {
      runningJob.stop();
      this.schedulerRegistry.deleteCronJob(strategyId);
      return true;
    } else {
      this.schedulerRegistry.deleteCronJob(strategyId);
      return true;
    }
  }

  isRunning(strategyId: string): boolean {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(strategyId);
    } catch (e) {
      runningJob = null;
    }
    return runningJob ? runningJob.running : false;
  }
}

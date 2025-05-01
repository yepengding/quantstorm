import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StrategyState } from './executor.dao';
import { StrategyClass } from '../strategy/strategy.types';
import { CronJob } from 'cron';

/**
 * Strategy Execution Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);

  // Execution counter
  private counter: number;

  // Execution lock to ensure singleton
  private isLocked: Map<string, boolean>;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(StrategyState)
    private stateRepository: Repository<StrategyState>,
  ) {
    this.counter = 0;
    this.isLocked = new Map<string, boolean>();
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
    // Initialize strategy execution lock
    this.isLocked.set(strategyId, false);

    // Schedule strategy execution
    this.counter = this.counter > 58 ? 0 : this.counter + 1;
    const job = new CronJob(`${this.counter}-59/5 * * * * *`, async () => {
      try {
        if (!this.isLocked.get(strategyId)) {
          this.isLocked.set(strategyId, true);
          await strategy.next();
        } else {
          this.logger.warn(`${strategyId} is locked`);
        }
      } catch (e) {
        this.logger.error(e);
        this.logger.error(`${strategyId} crashed`);
      } finally {
        this.isLocked.set(strategyId, false);
      }
    });
    this.schedulerRegistry.addCronJob(strategyId, job);
    job.start();
    return true;
  }

  async stop(strategyId: string) {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(strategyId);
    } catch (e) {
      runningJob = null;
      this.logger.error(e);
    }
    if (!runningJob) {
      return false;
    } else if (runningJob.isActive) {
      await runningJob.stop();
      this.schedulerRegistry.deleteCronJob(strategyId);
      this.isLocked.delete(strategyId);
      return true;
    } else {
      this.schedulerRegistry.deleteCronJob(strategyId);
      this.isLocked.delete(strategyId);
      return true;
    }
  }

  isRunning(strategyId: string): boolean {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(strategyId);
    } catch (e) {
      runningJob = null;
      this.logger.error(e);
    }
    return runningJob ? runningJob.isActive : false;
  }
}

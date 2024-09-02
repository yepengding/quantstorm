import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { BinancePerpBrokerService } from './broker/binance.perp.broker.service';
import { StrategyClass } from '../../strategy/strategy.types';
import { InjectRepository } from '@nestjs/typeorm';
import { StrategyState } from '../../strategy/strategy.dao';
import { Repository } from 'typeorm';

/**
 * Binance Perpetual Strategy Execution Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinancePerpService {
  private readonly logger = new Logger(BinancePerpService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly broker: BinancePerpBrokerService,
    @InjectRepository(StrategyState)
    private stateRepository: Repository<StrategyState>,
  ) {}

  async run(
    strategyClass: StrategyClass,
    strategyArgs: string,
  ): Promise<boolean> {
    // Instantiate strategy
    const strategy = new strategyClass(this.broker, this.stateRepository);

    // Initialize strategy
    try {
      await strategy.init(strategyArgs);
    } catch (e) {
      this.logger.error(
        `${this.getJobName(strategy.name)} crashed during initialization`,
      );
      this.logger.error(e.toString());
      return false;
    }

    // Schedule strategy execution
    const job = new CronJob(CronExpression.EVERY_5_SECONDS, async () => {
      try {
        await strategy.next();
      } catch {
        this.logger.error(`${this.getJobName(strategy.name)} crashed`);
        return;
      }
    });
    this.schedulerRegistry.addCronJob(this.getJobName(strategy.name), job);
    job.start();
    return true;
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

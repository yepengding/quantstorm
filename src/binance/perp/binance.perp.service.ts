import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
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

  private counter: number;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly broker: BinancePerpBrokerService,
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
    const strategy = new strategyClass(
      strategyId,
      this.broker,
      this.stateRepository,
    );

    // Initialize strategy
    try {
      await strategy.init(strategyArgs);
    } catch (e) {
      this.logger.error(
        `${this.getJobName(strategyId)} crashed during initialization`,
      );
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
        this.logger.error(`${this.getJobName(strategyId)} crashed`);
        return;
      }
    });
    this.schedulerRegistry.addCronJob(this.getJobName(strategyId), job);
    job.start();
    return true;
  }

  stop(strategyId: string) {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(
        this.getJobName(strategyId),
      );
    } catch (e) {
      runningJob = null;
    }
    if (!runningJob) {
      return false;
    } else if (runningJob.running) {
      runningJob.stop();
      this.schedulerRegistry.deleteCronJob(this.getJobName(strategyId));
      return true;
    } else {
      this.schedulerRegistry.deleteCronJob(this.getJobName(strategyId));
      return true;
    }
  }

  isRunning(strategyId: string): boolean {
    let runningJob: CronJob;
    try {
      runningJob = this.schedulerRegistry.getCronJob(
        this.getJobName(strategyId),
      );
    } catch (e) {
      runningJob = null;
    }
    return runningJob ? runningJob.running : false;
  }

  private getJobName(strategyId: string): string {
    return `${BinancePerpService.name}${strategyId}`;
  }
}

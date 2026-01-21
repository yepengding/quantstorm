import { Strategy } from './strategy.interface';
import { Repository } from 'typeorm';
import { StrategyState } from '../executor/executor.dao';
import {
  BacktestBroker,
  BacktestConfig,
} from '../broker/backtest/backtest.interface';
import { Interval } from '../core/types';
import { BacktestPerpBrokerService } from '../broker/backtest/perp/backtest.perp.broker.service';
import { BacktestPerpBroker } from '../broker/backtest/perp/backtest.perp.broker.interface';
import { BacktestSpotBrokerService } from '../broker/backtest/spot/backtest.spot.broker.service';
import { BacktestSpotBroker } from '../broker/backtest/spot/backtest.spot.broker.interface';
import { Currency } from '../core/structures/pair';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  readonly id: string;
  readonly name: string;
  readonly backtestBrokers: BacktestBroker[];
  protected readonly stateRepository: Repository<StrategyState>;
  private _backtestConfig: BacktestConfig;
  private _startTimestamp: number;
  private _executionInterval: Interval;

  constructor(id: string, stateRepository: Repository<StrategyState>) {
    this.id = id;
    this.name = 'Abstract';
    this.stateRepository = stateRepository;
    this.backtestBrokers = [];
  }

  abstract init(args: string): Promise<void>;

  abstract next(): Promise<void>;

  async setState<T>(value: T): Promise<void> {
    let state = await this.stateRepository.findOneBy({ id: this.id });
    if (!state) {
      state = this.stateRepository.create({
        id: this.id,
        name: this.name,
        value: JSON.stringify(value),
        timestamp: Date.now(),
      });
    } else {
      state.value = JSON.stringify(value);
      state.timestamp = Date.now();
    }

    await this.stateRepository.save(state);
  }

  async getState<T>(): Promise<T> {
    const state = await this.stateRepository.findOneBy({ id: this.id });
    return !!state ? (JSON.parse(state.value) as T) : null;
  }

  setBacktestConfig(
    config: BacktestConfig,
    startTimestamp: number,
    executionInterval: Interval,
  ): void {
    this._backtestConfig = config;
    this._startTimestamp = startTimestamp;
    this._executionInterval = executionInterval;
  }

  protected createBacktestSpotBroker(): BacktestSpotBroker {
    return this.initializeBacktestBroker(
      new BacktestSpotBrokerService(this._backtestConfig),
    ) as BacktestSpotBroker;
  }

  protected createBacktestPerpBroker(): BacktestPerpBroker {
    return this.initializeBacktestBroker(
      new BacktestPerpBrokerService(this._backtestConfig),
    ) as BacktestPerpBroker;
  }

  private initializeBacktestBroker(
    backtestBroker: BacktestBroker,
  ): BacktestBroker {
    // Initialize the balance
    for (const currency of Object.keys(Currency)) {
      backtestBroker.setBalance(currency as Currency, 1000);
    }
    // Initialize the backtest broker clock to the start timestamp
    backtestBroker.initClockAndInterval(
      this._startTimestamp,
      this._executionInterval,
    );
    this.backtestBrokers.push(backtestBroker);
    return backtestBroker;
  }
}

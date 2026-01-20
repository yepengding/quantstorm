import { Strategy } from './strategy.interface';
import { Repository } from 'typeorm';
import { StrategyState } from '../executor/executor.dao';
import { BacktestPerpBroker } from '../broker/backtest/perp/backtest.perp.broker.interface';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  readonly id: string;
  readonly name: string;
  protected readonly stateRepository: Repository<StrategyState>;
  private _backtestBroker: BacktestPerpBroker;

  constructor(id: string, stateRepository: Repository<StrategyState>) {
    this.id = id;
    this.name = 'Abstract';
    this.stateRepository = stateRepository;
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

  setBacktestBroker(backtestBroker: BacktestPerpBroker): void {
    this._backtestBroker = backtestBroker;
  }

  get backtestBroker(): Readonly<BacktestPerpBroker> {
    return this._backtestBroker;
  }
}

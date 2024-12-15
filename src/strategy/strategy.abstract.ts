import { Strategy } from './strategy.interface';
import { Repository } from 'typeorm';
import { StrategyState } from '../executor/executor.dao';
import { BacktestBroker } from '../broker/backtest/backtest.broker.interface';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  readonly id: string;
  readonly name: string;
  protected readonly stateRepository: Repository<StrategyState>;
  private _backtestBroker: BacktestBroker;

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
      });
    } else {
      state.value = JSON.stringify(value);
    }

    await this.stateRepository.save(state);
  }

  async getState<T>(): Promise<T> {
    const state = await this.stateRepository.findOneBy({ id: this.id });
    return !!state ? (JSON.parse(state.value) as T) : null;
  }

  setBacktestBroker(backtestBroker: BacktestBroker): void {
    this._backtestBroker = backtestBroker;
  }

  get backtestBroker(): Readonly<BacktestBroker> {
    return this._backtestBroker;
  }
}

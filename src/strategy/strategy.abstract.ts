import { Strategy } from './strategy.interface';
import { Broker } from '../core/interfaces/broker.interface';
import { BacktestBrokerService } from '../backtest/broker/backtest.broker.service';
import { Repository } from 'typeorm';
import { StrategyState } from './strategy.dao';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  readonly name: string;
  protected readonly broker: Broker;
  protected readonly stateRepository: Repository<StrategyState>;

  constructor(broker: Broker, stateRepository: Repository<StrategyState>) {
    this.name = 'StrategyAbstract';
    this.broker = broker;
    this.stateRepository = stateRepository;
  }

  abstract init(args: string): Promise<void>;

  abstract next(): Promise<void>;

  get backtestBroker() {
    return this.broker instanceof BacktestBrokerService ? this.broker : null;
  }

  async setState<T>(value: T): Promise<void> {
    let state = await this.stateRepository.findOneBy({ name: this.name });
    if (!state) {
      state = this.stateRepository.create({
        name: this.name,
        value: JSON.stringify(value),
      });
    } else {
      state.value = JSON.stringify(value);
    }

    await this.stateRepository.save(state);
  }

  async getState<T>(): Promise<T> {
    const state = await this.stateRepository.findOneBy({ name: this.name });
    return !!state ? (JSON.parse(state.value) as T) : null;
  }
}

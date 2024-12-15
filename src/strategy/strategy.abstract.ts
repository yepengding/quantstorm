import { Strategy } from './strategy.interface';
import { BacktestBrokerService } from '../backtest/broker/backtest.broker.service';
import { Repository } from 'typeorm';
import { StrategyState } from './strategy.dao';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  readonly id: string;
  readonly name: string;
  readonly testBroker: BacktestBrokerService;
  protected readonly stateRepository: Repository<StrategyState>;

  constructor(id: string, stateRepository: Repository<StrategyState>) {
    this.id = id;
    this.name = 'Abstract';
    // TODO Set backtest broker
    this.testBroker = null;
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
}

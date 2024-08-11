import { Strategy } from './strategy.interface';
import { Broker } from '../core/interfaces/broker.interface';
import { BacktestBrokerService } from '../backtest/broker/backtest.broker.service';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  readonly name: string;
  protected readonly broker: Broker;

  constructor(broker: Broker) {
    this.name = 'StrategyAbstract';
    this.broker = broker;
  }

  async init(): Promise<void> {}

  async next(): Promise<void> {}

  get backtestBroker() {
    return this.broker instanceof BacktestBrokerService ? this.broker : null;
  }
}

import { Strategy } from '../core/interfaces/strategy.interface';
import { Broker } from '../core/interfaces/broker.interface';
import { BacktestBrokerService } from '../backtest/broker/backtest.broker.service';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  protected readonly broker: Broker;

  constructor(broker: Broker) {
    this.broker = broker;
  }

  async init(): Promise<void> {}

  async next(): Promise<void> {}

  get backtestBroker() {
    return this.broker instanceof BacktestBrokerService ? this.broker : null;
  }
}

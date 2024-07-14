import { Broker, Strategy } from '../core/model';

export abstract class StrategyAbstract implements Strategy {
  protected readonly broker: Broker;

  constructor(broker: Broker) {
    this.broker = broker;
  }

  init(): void {}

  next(): void {}
}

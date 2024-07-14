import { Strategy } from '../core/interfaces/strategy.interface';
import { Broker } from '../core/interfaces/broker.interface';

/**
 * Abstract Strategy
 * @author Yepeng Ding
 */
export abstract class StrategyAbstract implements Strategy {
  protected readonly broker: Broker;

  constructor(broker: Broker) {
    this.broker = broker;
  }

  init(): void {}

  next(): void {}
}

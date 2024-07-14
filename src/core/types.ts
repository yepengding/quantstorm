import { Broker } from './interfaces/broker.interface';
import { StrategyAbstract } from '../strategy/strategy.abstract';

export type StrategyRegistryType = Map<
  string,
  { new (broker: Broker): StrategyAbstract }
>;

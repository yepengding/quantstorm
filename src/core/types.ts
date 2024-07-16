import { Broker } from './interfaces/broker.interface';
import { StrategyAbstract } from '../strategy/strategy.abstract';

export type StrategyRegistryType = Map<
  string,
  { new (broker: Broker): StrategyAbstract }
>;

export type Interval = '1m' | '3m' | '15m' | '30m' | '1h' | '2h';

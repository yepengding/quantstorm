import { Broker } from '../core/interfaces/broker.interface';
import { StrategyAbstract } from './strategy.abstract';

export type StrategyClass = { new (broker: Broker): StrategyAbstract };

export type StrategyRegistryType = Map<string, StrategyClass>;

import { Broker } from '../core/interfaces/broker.interface';
import { StrategyAbstract } from './strategy.abstract';
import { Repository } from 'typeorm';
import { StrategyState } from './strategy.dao';

export type StrategyClass = {
  new (
    id: string,
    broker: Broker,
    stateRepository: Repository<StrategyState>,
  ): StrategyAbstract;
};

export type StrategyRegistryType = Map<string, StrategyClass>;

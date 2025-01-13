import { StrategyAbstract } from './strategy.abstract';
import { Repository } from 'typeorm';
import { StrategyState } from '../executor/executor.dao';

export type StrategyClass = {
  new (
    id: string,
    stateRepository: Repository<StrategyState>,
  ): StrategyAbstract;
};

export type StrategyRegistryType = Map<string, StrategyClass>;

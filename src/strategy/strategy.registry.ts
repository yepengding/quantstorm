import { Demo } from './demo/demo';
import { StrategyRegistryType } from '../core/types';
import { ZoneRecovery } from './zone_recovery/zone_recovery';
import { Broker } from '../core/interfaces/broker.interface';
import { StrategyAbstract } from './strategy.abstract';

/**
 * Strategy Registry
 * @author Yepeng Ding
 */
export const registry: StrategyRegistryType = new Map<
  string,
  { new (broker: Broker): StrategyAbstract }
>([
  ['demo', Demo],
  ['zone_recovery', ZoneRecovery],
]);

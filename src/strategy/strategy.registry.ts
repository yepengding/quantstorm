import { Demo } from './demo/demo';
import { StrategyClass, StrategyRegistryType } from './strategy.types';

/**
 * Strategy Registry
 * @author Yepeng Ding
 */
export const registry: StrategyRegistryType = new Map<string, StrategyClass>([
  [Demo.name, Demo],
]);

import { Demo } from './demo/demo';
import { StrategyClass, StrategyRegistryType } from './strategy.types';
import { NeutralGrid } from './neutral_grid/neutral_grid';

/**
 * Strategy Registry
 * @author Yepeng Ding
 */
export const registry: StrategyRegistryType = new Map<string, StrategyClass>([
  [Demo.name, Demo],
  [NeutralGrid.name, NeutralGrid],
]);

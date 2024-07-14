import { Demo } from './demo/demo';
import { StrategyRegistryType } from '../core/types';

/**
 * Strategy Registry
 * @author Yepeng Ding
 */
export const registry: StrategyRegistryType = new Map([['Demo', Demo]]);

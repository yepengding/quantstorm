import { PerpetualPair } from '../../../../core/structures/pair';
import { StateManager } from './state_manager';

describe('StateManager', () => {
  it('should find correct nearest level', () => {
    const stateManager = new StateManager({
      pair: new PerpetualPair('ETH', 'USDC'),
      lower: 2900,
      upper: 3100,
      number: 10,
      size: 0.1,
      maxTrial: 3,
    });
    expect(stateManager.getNearestLevel(2800).index).toBe(0);
    expect(stateManager.getNearestLevel(3001).index).toBe(5);
    expect(stateManager.getNearestLevel(3010).index).toBe(6);
    expect(stateManager.getNearestLevel(3011).index).toBe(6);
    expect(stateManager.getNearestLevel(3100).index).toBe(10);
  });
});

import { OptionTool } from './option_tool';

describe('OptionTool', () => {
  it('should calculate call price correctly', () => {
    const S = 2060; // Current spot price
    const K = 2000; // Strike price
    const T = 17 / 365; // Time to expiration in years
    const sigma = 0.77; // Implied volatility (77%)
    const r = 0.05; // Risk-free interest rate (5%)

    const callPrice = OptionTool.calculateCallPrice(S, K, T, sigma, r);
    expect(callPrice).toBeCloseTo(169, 0); // Expected call price
  });

  it('should calculate put price correctly', () => {
    const S = 2060; // Current spot price
    const K = 2000; // Strike price
    const T = 17 / 365; // Time to expiration in years
    const sigma = 0.77; // Implied volatility (77%)
    const r = 0.05; // Risk-free interest rate (5%)

    const putPrice = OptionTool.calculatePutPrice(S, K, T, sigma, r);
    expect(putPrice).toBeCloseTo(104, 0); // Expected put price
  });
});

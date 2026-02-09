import { Greeks } from '../core/interfaces/market.interface';
import { OptionTool } from './option_tool';

describe('OptionTool', () => {
  it('should calculate call price by greeks correctly', () => {
    const spotPrice = 2060;
    const greeks: Greeks = {
      symbol: 'ETH/USDT:USDT-260327-2200-C',
      price: 151,
      bidIV: 0.7,
      askIV: 0.72,
      delta: 0.44854,
      gamma: 0.00075,
      theta: -2.27146,
      vega: 2.87291,
    };

    const prices = OptionTool.calculatePriceByGreeks(spotPrice, greeks);
    expect(prices.bid).toBeCloseTo(greeks.price, 0);
  });
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

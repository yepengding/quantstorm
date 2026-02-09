import { Greeks } from '../core/interfaces/market.interface';
import { OptionPair } from '../core/structures/pair';
import { OptionSide } from '../core/constants';

/**
 * Option Tool
 *
 * @author Yepeng Ding
 */
export class OptionTool {
  static calculatePriceByGreeks(
    spotPrice: number,
    greeks: Greeks,
  ): Record<'bid' | 'ask', number> {
    const pair = OptionPair.fromSymbol(greeks.symbol);
    const timeToExpiryInYears = pair.timeToExpiryInYears();
    return pair.side === OptionSide.CALL
      ? {
          bid: this.calculateCallPrice(
            spotPrice,
            pair.strike,
            timeToExpiryInYears,
            greeks.bidIV,
          ),
          ask: this.calculateCallPrice(
            spotPrice,
            pair.strike,
            timeToExpiryInYears,
            greeks.askIV,
          ),
        }
      : {
          bid: this.calculatePutPrice(
            spotPrice,
            pair.strike,
            timeToExpiryInYears,
            greeks.bidIV,
          ),
          ask: this.calculatePutPrice(
            spotPrice,
            pair.strike,
            timeToExpiryInYears,
            greeks.askIV,
          ),
        };
  }

  /**
   * Calculates the Black-Scholes Price for a CALL Option
   *
   * @param S Current spot price
   * @param K Strike price
   * @param T Time to expiration in years (e.g., 17 days = 17/365)
   * @param sigma Implied volatility (decimal, e.g., 0.85 for 85%)
   * @param r Risk-free interest rate (decimal, e.g., 0.04 for 4%)
   *
   * @return Call option price
   */
  static calculateCallPrice(
    S: number,
    K: number,
    T: number,
    sigma: number,
    r: number = 0.04,
  ): number {
    const { d1, d2 } = this.computeProbabilities(S, K, T, sigma, r);

    const N_d1 = this.cumulativeNormalDistribution(d1);
    const N_d2 = this.cumulativeNormalDistribution(d2);

    // Call = S * N(d1) - K * e^(-rT) * N(d2)
    return S * N_d1 - K * Math.exp(-r * T) * N_d2;
  }

  /**
   * Calculates the Black-Scholes Price for a PUT Option
   *
   * @param S Current spot price
   * @param K Strike price
   * @param T Time to expiration in years (e.g., 17 days = 17/365)
   * @param sigma Implied volatility (decimal, e.g., 0.85 for 85%)
   * @param r Risk-free interest rate (decimal, e.g., 0.04 for 4%)
   * @return Put option price
   */
  static calculatePutPrice(
    S: number,
    K: number,
    T: number,
    sigma: number,
    r: number = 0.04,
  ): number {
    const { d1, d2 } = this.computeProbabilities(S, K, T, sigma, r);

    const N_neg_d1 = this.cumulativeNormalDistribution(-d1);
    const N_neg_d2 = this.cumulativeNormalDistribution(-d2);

    // Put = K * e^(-rT) * N(-d2) - S * N(-d1)
    return K * Math.exp(-r * T) * N_neg_d2 - S * N_neg_d1;
  }

  /**
   * Standard Normal Cumulative Distribution Function (CDF)
   * Uses the Abramowitz and Stegun approximation.
   * Precision: Absolute error < 7.5e-8
   */
  private static cumulativeNormalDistribution(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804014337 * Math.exp((-x * x) / 2);
    const prob =
      d *
      t *
      (0.31938153 +
        t *
          (-0.356563782 +
            t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));

    return x > 0 ? 1 - prob : prob;
  }

  /**
   * Computes d1 and d2 internal probability factors
   */
  private static computeProbabilities(
    S: number,
    K: number,
    T: number,
    sigma: number,
    r: number,
  ): { d1: number; d2: number } {
    const d1 =
      (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) /
      (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    return { d1, d2 };
  }
}

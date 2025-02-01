import { Series } from '../core/structures/series';

/**
 * Indicator Library
 *
 * @author Yepeng Ding
 */
export class Indicator {
  /**
   * Simple Moving Average
   *
   * @param series
   * @param length
   * @constructor
   */
  public static SMA(series: number[], length: number): number[] {
    if (series.length <= length) {
      return series;
    }
    const result = [];
    for (let i = length - 1; i < series.length; i++) {
      let sum = 0;
      for (let j = 0; j < length; j++) {
        sum += series[i - j];
      }
      result.push(sum / length);
    }

    return result;
  }

  /**
   * Exponential Moving Average
   *
   * @param series
   * @param length
   * @constructor
   */
  public static EMA(series: number[], length: number): number[] {
    if (series.length <= length) {
      return series;
    }
    const alpha = 2 / (length + 1);
    const result = [series[0]];
    for (let i = 1; i < series.length; i++) {
      result.push(series[i] * alpha + result[i - 1] * (1 - alpha));
    }

    return result;
  }

  /**
   * Bollinger bands
   *
   * @param series
   * @param length
   * @param multiplier
   * @constructor
   */
  public static BollingerBands(
    series: number[],
    length: number,
    multiplier: number,
  ): Record<'basis' | 'upper' | 'lower', number[]> {
    const basis: Series = new Series(series.slice(-length));
    const dev = multiplier * basis.std();
    const upper = basis.add([dev]);
    const lower = basis.sub([dev]);
    return { basis: basis.toNumbers(), upper, lower };
  }

  public static MACD(
    series: number[],
    fastLength: number,
    slowLength: number,
    length: number,
  ): Record<'macd' | 'signal' | 'hist', number[]> {
    if (series.length < Math.max(fastLength, slowLength, length)) {
      throw new Error(
        'Series length must be greater than or equal to the maximum of fastLength, slowLength, and length.',
      );
    }
    // Calculate the fast and slow EMAs
    const fastEMA = this.EMA(series, fastLength);
    const slowEMA = this.EMA(series, slowLength);

    // Calculate the MACD line
    const macdLine: number[] = [];
    for (let i = 0; i < series.length; i++) {
      macdLine[i] = fastEMA[i] - slowEMA[i];
    }

    const signalLine = this.EMA(macdLine, length);

    // Calculate the MACD histogram
    const histogram: number[] = [];
    for (let i = 0; i < series.length; i++) {
      histogram[i] = macdLine[i] - signalLine[i];
    }

    return {
      macd: macdLine,
      signal: signalLine,
      hist: histogram,
    };
  }
}

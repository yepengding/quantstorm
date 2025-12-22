import * as math from 'mathjs';

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
    const result: number[] = [];
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
    const result = [math.mean(series.slice(0, length))];
    for (let i = length, j = 1; i < series.length; i++, j++) {
      result.push(series[i] * alpha + result[j - 1] * (1 - alpha));
    }

    return result;
  }

  /**
   * Relative Moving Average
   *
   * @param series
   * @param length
   * @constructor
   */
  public static RMA(series: number[], length: number): number[] {
    if (series.length <= length) {
      return series;
    }
    const alpha = 1 / length;
    const result = [math.mean(series.slice(0, length))];
    for (let i = length, j = 1; i < series.length; i++, j++) {
      result.push(series[i] * alpha + result[j - 1] * (1 - alpha));
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
    const basis: number[] = [];
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = length - 1; i < series.length; i++) {
      const window = series.slice(i - length + 1, i + 1);
      const mean = math.mean(window);
      const dev = multiplier * Number(math.std(window));

      basis.push(mean);
      upper.push(mean + dev);
      lower.push(mean - dev);
    }

    return { basis, upper, lower };
  }

  /**
   * Moving Average Convergence Divergence
   *
   * @param series
   * @param fastLength
   * @param slowLength
   * @param length
   * @constructor
   */
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
    // 1. Calculate Fast and Slow EMAs
    const fastEMA = this.EMA(series, fastLength);
    const slowEMA = this.EMA(series, slowLength);

    // 2. Validate sufficient data
    // We need enough data to calculate the slow EMA at the very least.
    if (slowEMA.length === 0) {
      return { macd: [], signal: [], hist: [] };
    }

    // 3. Align Fast and Slow EMAs
    // The Slow EMA starts later than the Fast EMA.
    // We must skip the early parts of the Fast EMA to match the start of the Slow EMA.
    // Alignment Offset = Slow Length - Fast Length
    const alignOffset = slowLength - fastLength;
    const fastEMAAligned = fastEMA.slice(alignOffset);

    // 4. Calculate the MACD Line (Fast - Slow)
    const macdLine: number[] = [];
    for (let i = 0; i < slowEMA.length; i++) {
      macdLine.push(fastEMAAligned[i] - slowEMA[i]);
    }

    // 5. Calculate Signal Line (EMA of the MACD Line)
    const signal = this.EMA(macdLine, length);

    // 6. Align MACD Line with Signal Line
    // The Signal EMA consumes the first 'length' points of the MACD line.
    // We trim the MACD line to match the Signal line's start.
    const macd = macdLine.slice(length - 1);

    // 7. Calculate Histogram (MACD - Signal)
    const hist: number[] = [];
    for (let i = 0; i < signal.length; i++) {
      hist.push(macd[i] - signal[i]);
    }

    // Return all three arrays aligned to the same timeframe (the end of the data)
    return { macd, signal, hist };
  }
}

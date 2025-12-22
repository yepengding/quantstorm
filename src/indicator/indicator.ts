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

  /**
   * Calculates the Relative Strength Index (RSI) with Wilder's Smoothing
   *
   * @param series
   * @param length - The lookback period (typically 14)
   * @returns number[] - The RSI values (0 to 100)
   */
  public static RSI(series: number[], length: number): number[] {
    // 1. Validation
    // We need at least length + 1 data points to calculate the first RSI
    // (14 periods of change requires 15 price points)
    if (series.length <= length) {
      return [];
    }

    let avgGain = 0;
    let avgLoss = 0;

    // 2. Calculate Initial Average Gain/Loss (Simple Mean)
    // We loop through the first 'length' changes.
    // Note: change calculation starts at index 1 (current - previous)
    for (let i = 1; i <= length; i++) {
      const change = series[i] - series[i - 1];
      if (change > 0) {
        avgGain += change;
      } else {
        avgLoss += Math.abs(change);
      }
    }

    avgGain /= length;
    avgLoss /= length;

    // Calculate first RSI
    const rsiArray: number[] = [];

    // Helper to calculate RSI from averages
    const calculateRSI = (gain: number, loss: number) => {
      if (loss === 0) return 100; // Prevent divide by zero
      const rs = gain / loss;
      return 100 - 100 / (1 + rs);
    };

    rsiArray.push(calculateRSI(avgGain, avgLoss));

    // 3. Calculate Subsequent RSIs (Wilder's Smoothing)
    for (let i = length + 1; i < series.length; i++) {
      const change = series[i] - series[i - 1];
      let currentGain = 0;
      let currentLoss = 0;

      if (change > 0) {
        currentGain = change;
      } else {
        currentLoss = Math.abs(change);
      }

      // Wilder's Smoothing Formula:
      // New Avg = ((Prev Avg * (length - 1)) + Current) / length
      avgGain = (avgGain * (length - 1) + currentGain) / length;
      avgLoss = (avgLoss * (length - 1) + currentLoss) / length;

      rsiArray.push(calculateRSI(avgGain, avgLoss));
    }

    return rsiArray;
  }

  /**
   * Average True Range (ATR) with Wilder's Smoothing
   *
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param close - Array of close prices
   * @param length - The smoothing period (typically 14)
   * @returns number[] - The ATR values (starting after the first valid period)
   */
  public static ATR(
    high: number[],
    low: number[],
    close: number[],
    length: number = 14,
  ): number[] {
    // 1. Validation
    if (high.length !== low.length || low.length !== close.length) {
      throw new Error(
        'Input arrays (High, Low, Close) must have the same length.',
      );
    }
    if (high.length <= length) {
      throw new Error(
        'Length must be greater than the length of the input arrays (High, Low, Close).',
      );
    }

    // 2. Calculate True Ranges (TR)
    // The first TR is simply High - Low.
    // Subsequent TRs are Max(H-L, |H-PrevClose|, |L-PrevClose|)
    const trueRanges: number[] = [];

    for (let i = 0; i < high.length; i++) {
      if (i === 0) {
        trueRanges.push(high[i] - low[i]);
      } else {
        const hl = high[i] - low[i];
        const hpc = Math.abs(high[i] - close[i - 1]);
        const lpc = Math.abs(low[i] - close[i - 1]);
        trueRanges.push(Math.max(hl, hpc, lpc));
      }
    }

    // 3. Calculate ATR using Wilder's Smoothing
    // The first ATR value is the arithmetic mean (SMA) of the first 'length' TRs.
    let firstATR = 0;
    for (let i = 0; i < length; i++) {
      firstATR += trueRanges[i];
    }
    firstATR /= length;

    const atrResult: number[] = [firstATR];

    // Subsequent values use the smoothing formula:
    // ATR = ((Prior ATR * (length - 1)) + Current TR) / length
    for (let i = length; i < trueRanges.length; i++) {
      const currentTR = trueRanges[i];
      const priorATR = atrResult[atrResult.length - 1];

      const nextATR = (priorATR * (length - 1) + currentTR) / length;
      atrResult.push(nextATR);
    }

    return atrResult;
  }

  public static ADX(
    high: number[],
    low: number[],
    close: number[],
    length: number = 14,
  ): number[] {
    const seriesLength = high.length;

    // 1. Validate Input
    if (
      high.length !== low.length ||
      low.length !== close.length ||
      seriesLength < length * 2
    ) {
      // We need at least 2 * period data points to generate the first valid ADX value
      // (14 for TR/DM warm-up + 14 for ADX smoothing)
      throw new Error(
        'Inputs must have equal length and sufficient data (at least 2x period).',
      );
    }

    const adx: number[] = new Array(seriesLength).fill(0);

    // Arrays for True Range (TR) and Directional Movements (+DM, -DM)
    // We initialize with 0 for index 0 to align with price arrays
    const tr: number[] = new Array(seriesLength).fill(0);
    const dmPlus: number[] = new Array(seriesLength).fill(0);
    const dmMinus: number[] = new Array(seriesLength).fill(0);

    // 2. Calculate TR and Raw Directional Movements
    for (let i = 1; i < seriesLength; i++) {
      const currentHigh = high[i];
      const currentLow = low[i];
      const prevHigh = high[i - 1];
      const prevLow = low[i - 1];
      const prevClose = close[i - 1];

      // True Range
      const hl = currentHigh - currentLow;
      const hpc = Math.abs(currentHigh - prevClose);
      const lpc = Math.abs(currentLow - prevClose);
      tr[i] = Math.max(hl, hpc, lpc);

      // Directional Movements
      const upMove = currentHigh - prevHigh;
      const downMove = prevLow - currentLow;

      if (upMove > downMove && upMove > 0) {
        dmPlus[i] = upMove;
      } else {
        dmPlus[i] = 0;
      }

      if (downMove > upMove && downMove > 0) {
        dmMinus[i] = downMove;
      } else {
        dmMinus[i] = 0;
      }
    }

    const calculateWildersRMA = (
      values: number[],
      period: number,
    ): number[] => {
      const rma: number[] = new Array(values.length).fill(0);

      // 1. Calculate the initial SMA (Simple Moving Average)
      // We sum values from index 1 to period (ignoring index 0 which is usually dummy/gap)
      // Note: In our main function, real data starts at index 1.
      // So the first "period" of data is indices 1 to 14.
      let sum = 0;
      for (let i = 1; i <= period; i++) {
        sum += values[i];
      }

      rma[period] = sum / period;

      // 2. Calculate subsequent values
      for (let i = period + 1; i < values.length; i++) {
        const prev = rma[i - 1];
        const curr = values[i];

        // Standard Wilder's formula: (Prior * (n-1) + Current) / n
        rma[i] = (prev * (period - 1) + curr) / period;
      }

      return rma;
    };

    // 3. Smooth the TR, +DM, and -DM using Wilder's Running Moving Average (RMA)
    // This makes smoothTr equivalent to ATR (Average True Range)
    const smoothTr = calculateWildersRMA(tr, length);
    const smoothDmPlus = calculateWildersRMA(dmPlus, length);
    const smoothDmMinus = calculateWildersRMA(dmMinus, length);

    // 4. Calculate DX (Directional Index)
    const dx: number[] = new Array(seriesLength).fill(0);

    for (let i = 0; i < seriesLength; i++) {
      // Before length, smoothing is not fully established, but we can compute if data exists.
      // However, usually we ignore data before index `length`.
      const trVal = smoothTr[i];

      // Avoid division by zero
      if (trVal === 0) {
        dx[i] = 0;
        continue;
      }

      // Calculate +DI and -DI
      const diPlus = (smoothDmPlus[i] / trVal) * 100;
      const diMinus = (smoothDmMinus[i] / trVal) * 100;

      const diSum = diPlus + diMinus;
      const diDiff = Math.abs(diPlus - diMinus);

      if (diSum === 0) {
        dx[i] = 0;
      } else {
        dx[i] = (diDiff / diSum) * 100;
      }
    }

    // 5. Calculate ADX (Smoothed DX)
    // The ADX is simply the RMA (Wilder's Smoothing) of the DX values.

    // Note: There is a specific bootstrap for the first ADX value.
    // The classic method is: First ADX = Average of first 'length' DX values.
    // Subsequent ADX = ((Prior ADX * (length - 1)) + Current DX) / length

    // The first valid DX value is at index `length`.
    // We need `length` count of DX values to start.
    // So the first ADX is calculated at index `length + length - 1`.

    const firstAdxIdx = 2 * length - 1;

    // Safety check for length
    if (seriesLength <= firstAdxIdx) return adx;

    let firstAdxSum = 0;
    for (let i = length; i < length + length; i++) {
      firstAdxSum += dx[i];
    }

    adx[firstAdxIdx] = firstAdxSum / length;

    // Calculate remaining ADX values using the smoothing formula
    for (let i = firstAdxIdx + 1; i < seriesLength; i++) {
      const prevAdx = adx[i - 1];
      const currentDx = dx[i];
      adx[i] = (prevAdx * (length - 1) + currentDx) / length;
    }

    return adx;
  }
}

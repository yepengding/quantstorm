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

    // 1. Calculate the first window using mathjs
    const initialMean = math.mean(series.slice(0, length));
    result.push(initialMean);

    let currentSum = initialMean * length;

    for (let i = length; i < series.length; i++) {
      currentSum = currentSum - series[i - length] + series[i];
      result.push(currentSum / length);
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

    const seriesLength = high.length;

    // Optimization: Single-pass calculation without intermediate 'trueRanges' array.

    // 1. Calculate Initial ATR (SMA of first 'length' TRs) manually to avoid allocating a TR array for math.mean
    let trSum = 0;
    // First TR is always High - Low
    trSum += high[0] - low[0];

    for (let i = 1; i < length; i++) {
      const hl = high[i] - low[i];
      const hpc = Math.abs(high[i] - close[i - 1]);
      const lpc = Math.abs(low[i] - close[i - 1]);
      trSum += Math.max(hl, hpc, lpc);
    }

    let currentATR = trSum / length;
    const atrResult: number[] = [currentATR];

    // 2. Wilder's Smoothing for the rest
    for (let i = length; i < seriesLength; i++) {
      const hl = high[i] - low[i];
      const hpc = Math.abs(high[i] - close[i - 1]);
      const lpc = Math.abs(low[i] - close[i - 1]);
      const currentTR = Math.max(hl, hpc, lpc);

      // Formula: ((Prior ATR * (length - 1)) + Current TR) / length
      currentATR = (currentATR * (length - 1) + currentTR) / length;
      atrResult.push(currentATR);
    }

    return atrResult;
  }

  /**
   * Average Directional Index (ADX) with Wilder's Smoothing
   *
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param close - Array of close prices
   * @param length - The smoothing period (typically 14)
   * @returns number[] - The ADX values (starting after the first valid period)
   */
  public static ADX(
    high: number[],
    low: number[],
    close: number[],
    length: number = 14,
  ): number[] {
    const seriesLength = high.length;

    if (
      high.length !== low.length ||
      low.length !== close.length ||
      seriesLength < length * 2
    ) {
      throw new Error(
        'Inputs must have equal length and sufficient data (at least 2x period).',
      );
    }

    const adx: number[] = new Array(seriesLength).fill(0);

    // Initial Sums for RMA Calculation (indices 1 to length)
    let sumTr = 0;
    let sumDmPlus = 0;
    let sumDmMinus = 0;

    // Current Smoothed Values (RMA)
    let smoothTr = 0;
    let smoothDmPlus = 0;
    let smoothDmMinus = 0;

    // Sum for ADX Calculation (indices length to 2*length - 1)
    let sumDx = 0;

    // Index where the first valid ADX value is produced
    const firstAdxIdx = 2 * length - 1;

    for (let i = 0; i < seriesLength; i++) {
      // --- 1. Calculate TR and Directional Movements ---
      let tr = 0;
      let dmPlus = 0;
      let dmMinus = 0;

      if (i > 0) {
        const currentHigh = high[i];
        const currentLow = low[i];
        const prevHigh = high[i - 1];
        const prevLow = low[i - 1];
        const prevClose = close[i - 1];

        const hl = currentHigh - currentLow;
        const hpc = Math.abs(currentHigh - prevClose);
        const lpc = Math.abs(currentLow - prevClose);
        tr = Math.max(hl, hpc, lpc);

        const upMove = currentHigh - prevHigh;
        const downMove = prevLow - currentLow;

        if (upMove > downMove && upMove > 0) {
          dmPlus = upMove;
        }
        if (downMove > upMove && downMove > 0) {
          dmMinus = downMove;
        }
      }

      // --- 2. Calculate Smoothed TR/DM (RMA) ---

      // Phase A: Accumulation (Warm-up for RMA)
      // We sum values from index 1 up to index `length`.
      if (i <= length) {
        if (i > 0) {
          sumTr += tr;
          sumDmPlus += dmPlus;
          sumDmMinus += dmMinus;
        }
        // If we haven't reached the end of the first period, continue.
        // We cannot calculate DX or ADX until we have the first smoothed values.
        if (i < length) continue;
      }

      // Phase B: Initialize RMA at index `length`
      if (i === length) {
        smoothTr = sumTr / length;
        smoothDmPlus = sumDmPlus / length;
        smoothDmMinus = sumDmMinus / length;
      }
      // Phase C: Standard Wilder's Smoothing for i > length
      else {
        smoothTr = (smoothTr * (length - 1) + tr) / length;
        smoothDmPlus = (smoothDmPlus * (length - 1) + dmPlus) / length;
        smoothDmMinus = (smoothDmMinus * (length - 1) + dmMinus) / length;
      }

      // --- 3. Calculate DX ---
      let dx = 0;
      if (smoothTr !== 0) {
        const diPlus = (smoothDmPlus / smoothTr) * 100;
        const diMinus = (smoothDmMinus / smoothTr) * 100;
        const diSum = diPlus + diMinus;
        const diDiff = Math.abs(diPlus - diMinus);
        if (diSum !== 0) {
          dx = (diDiff / diSum) * 100;
        }
      }

      // --- 4. Calculate ADX ---

      // Phase D: Accumulation (Warm-up for ADX)
      // We need `length` amount of DX values starting from index `length`.
      if (i <= firstAdxIdx) {
        sumDx += dx;
        if (i < firstAdxIdx) continue;
      }

      // Phase E: Initialize ADX
      if (i === firstAdxIdx) {
        adx[i] = sumDx / length;
      }
      // Phase F: Standard ADX Smoothing
      else {
        adx[i] = (adx[i - 1] * (length - 1) + dx) / length;
      }
    }

    return adx;
  }

  /**
   * SuperTrend
   *
   * @param high
   * @param low
   * @param close
   * @param factor
   * @param length
   * @returns number[] - The SuperTrend values
   */
  public static SuperTrend(
    high: number[],
    low: number[],
    close: number[],
    factor: number = 3,
    length: number = 7,
  ): number[] {
    if (high.length !== low.length || low.length !== close.length) {
      throw new Error('Inputs must have equal length.');
    }

    // Reuse the optimized ATR implementation
    const atr = Indicator.ATR(high, low, close, length);

    // ATR result starts from index `period - 1` relative to the input arrays
    const result: number[] = [];
    const offset = length - 1;

    let prevFinalUpper = 0;
    let prevFinalLower = 0;
    // Trend Direction: 1 for Up, -1 for Down
    let prevTrend = 1;

    for (let i = 0; i < atr.length; i++) {
      const dataIdx = i + offset;
      const currentHigh = high[dataIdx];
      const currentLow = low[dataIdx];
      const currentClose = close[dataIdx];
      const currentAtr = atr[i];

      const mid = (currentHigh + currentLow) / 2;
      const basicUpper = mid + factor * currentAtr;
      const basicLower = mid - factor * currentAtr;

      let finalUpper = basicUpper;
      let finalLower = basicLower;

      // Logic to stick the bands to the trend
      if (i > 0) {
        const prevClose = close[dataIdx - 1];

        if (basicUpper < prevFinalUpper || prevClose > prevFinalUpper) {
          finalUpper = basicUpper;
        } else {
          finalUpper = prevFinalUpper;
        }

        if (basicLower > prevFinalLower || prevClose < prevFinalLower) {
          finalLower = basicLower;
        } else {
          finalLower = prevFinalLower;
        }
      }

      // Determine Trend
      let trend = prevTrend;
      if (i > 0) {
        if (prevTrend === 1) {
          // If was Up and closed below Lower Band -> Trend Down
          if (currentClose < finalLower) {
            trend = -1;
          }
        } else {
          // If was Down and closed above Upper Band -> Trend Up
          if (currentClose > finalUpper) {
            trend = 1;
          }
        }
      } else {
        // Initialization: assume trend based on close relative to bands
        if (currentClose > finalUpper) trend = 1;
        else if (currentClose < finalLower) trend = -1;
      }

      // Select the Supertrend value
      const supertrend = trend === 1 ? finalLower : finalUpper;
      result.push(supertrend);

      // Update State
      prevFinalUpper = finalUpper;
      prevFinalLower = finalLower;
      prevTrend = trend;
    }

    return result;
  }
}

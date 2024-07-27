import * as math from 'mathjs';
import { KLine } from './interfaces/market.interface';

/**
 * Series Structure
 *
 * @author Yepeng Ding
 */
export class Series {
  private readonly series: number[];

  constructor(series: number[]) {
    this.series = series;
  }

  /**
   * Add the given series
   * If the given series only contains one element, then add this element to each element of the encapsulated series
   *
   * @param series
   */
  public add(series: number[]): number[] {
    return math.add(this.series, series);
  }

  /**
   * Subtract the given series
   * If the given series only contains one element, then subtract this element from each element of the encapsulated series
   *
   * @param series
   */
  public sub(series: number[]): number[] {
    return math.subtract(this.series, series);
  }

  /**
   * Check whether crossing over the given series
   *
   * @param series
   */
  public crossingOver(series: number[]): boolean {
    if (this.series.length < 2 || series.length == 0) {
      return false;
    }
    if (
      series.length == 1 &&
      this.series.at(-2) <= series[0] &&
      this.series.at(-1) > series[0]
    ) {
      return true;
    }
    return (
      this.series.at(-2) <= series.at(-2) && this.series.at(-1) > series.at(-1)
    );
  }

  /**
   * Unbiased standard deviation
   */
  public std(): number {
    return parseFloat(math.std(this.series).toString());
  }

  /**
   * Convert to number array
   */
  public toNumbers(): number[] {
    return this.series;
  }
}

export class KLines {
  private readonly kLines: KLine[];

  constructor(kLines: KLine[]) {
    this.kLines = kLines;
  }

  public at(index: number): KLine {
    return this.kLines.at(index);
  }

  get length() {
    return this.kLines.length;
  }

  get open(): number[] {
    return this.kLines.map((l) => l.open);
  }

  get high(): number[] {
    return this.kLines.map((l) => l.high);
  }

  get low(): number[] {
    return this.kLines.map((l) => l.low);
  }

  get close(): number[] {
    return this.kLines.map((l) => l.close);
  }

  get volume(): number[] {
    return this.kLines.map((l) => l.volume);
  }
}

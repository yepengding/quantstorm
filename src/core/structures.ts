import * as math from 'mathjs';

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

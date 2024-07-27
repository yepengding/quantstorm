import { Series } from '../core/structures/series';

/**
 * Indicator Library
 *
 * @author Yepeng Ding
 */
export class Indicator {
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
}

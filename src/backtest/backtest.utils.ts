import { Interval } from '../core/types';

/**
 * Get timestamp difference of the given time interval
 *
 * @param interval time interval, e.g., '1m', '15m', '1h'
 */
export function toTimestampInterval(interval: Interval): number {
  switch (interval) {
    case '1m':
      return 60;
    case '15m':
      return 900;
    case '30m':
      return 1800;
    default:
      throw new Error('Unsupported interval');
  }
}

import { Interval } from '../core/types';

export function toTimestampInterval(interval: Interval): number {
  switch (interval) {
    case '1m':
      return 60;
    default:
      return 0;
  }
}

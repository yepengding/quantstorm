import { Interval } from '../core/types';
import { Pair } from '../core/structures/pair';

export async function getMarketPrice(pair: Pair): Promise<number> {
  const kLines = await this.feeder.getBinanceKLines(
    pair,
    this.interval,
    this.clock,
    1,
  );
  if (kLines.length == 0) {
    throw new Error('Failed to get the market price.');
  }
  return kLines[0].close;
}

/**
 * Get UNIX timestamp difference of the given time interval
 *
 * @param interval time interval, e.g., '1m', '15m', '1h'
 */
export function toTimestampInterval(interval: Interval): number {
  switch (interval) {
    case '1m':
      return 60;
    case '3m':
      return 180;
    case '5m':
      return 300;
    case '15m':
      return 900;
    case '30m':
      return 1800;
    case '1h':
      return 3600;
    case '2h':
      return 7200;
    case '4h':
      return 14400;
    default:
      throw new Error('Unsupported interval');
  }
}

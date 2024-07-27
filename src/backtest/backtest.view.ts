import { KLine } from '../core/interfaces/market.interface';
import { ChartKLine } from './backtest.interface';

export function toCharKLines(kLines: KLine[]): ChartKLine[] {
  return kLines.map((k) => {
    return {
      x: k.timestamp * 1000,
      o: k.open,
      h: k.high,
      l: k.low,
      c: k.close,
    };
  });
}

import { StrategyAbstract } from '../strategy.abstract';
import { KLine } from '../../core/interfaces/k-line.interface';

/**
 * Demo Strategy
 * @author Yepeng Ding
 */
export class Demo extends StrategyAbstract {
  init(): void {
    this.broker.placeMarketLong('BTC', 1);
  }

  next(kLine: KLine): void {
    console.log(kLine);
    this.broker.placeMarketShort('BTC', 1);
  }
}

import { StrategyAbstract } from '../strategy.abstract';

/**
 * Demo Strategy
 * @author Yepeng Ding
 */
export class Demo extends StrategyAbstract {
  init(): void {
    this.broker.placeMarketLong('BTC', 1);
  }

  next(): void {
    this.broker.placeMarketShort('BTC', 1);
  }
}

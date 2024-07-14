import { StrategyAbstract } from '../strategy.abstract';

export class Demo extends StrategyAbstract {
  init(): void {
    this.broker.placeMarketLong('BTC', 1);
  }

  next(): void {
    this.broker.placeMarketLong('BTC', 1);
  }
}

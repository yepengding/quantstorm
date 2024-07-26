import { StrategyAbstract } from '../strategy.abstract';
import { Interval } from '../../core/types';
import { Indicator } from '../../indicator/indicator';

/**
 * Demo Strategy
 * @author Yepeng Ding
 */
export class Demo extends StrategyAbstract {
  // Strategy configuration
  private config = {
    symbol: 'BTC/USDT',
    size: 1,
    interval: '30m' as Interval,
  };

  async init(): Promise<void> {
    const order = await this.broker
      .placeMarketLong(this.config.symbol, this.config.size)
      .catch(() => null);
    if (order) {
      console.log(`Long ${this.config.size} BTC at ${order.price}`);
    }
  }

  async next(): Promise<void> {
    const kLines = await this.broker.getKLines(
      this.config.symbol,
      this.config.interval,
    );
    // Strategy only executes when the number of the received K-lines >= 10
    if (kLines.length < 10) {
      return;
    }

    const position = await this.broker.getPosition(this.config.symbol);
    const { lower } = Indicator.BollingerBands(kLines.close, 10, 2);

    if (
      position &&
      kLines.at(-1).close > lower.at(-1) &&
      kLines.at(-1).close > position.entryPrice
    ) {
      const order = await this.broker
        .placeMarketShort(this.config.symbol, this.config.size)
        .catch(() => null);
      if (order) {
        console.log(`Short ${this.config.size} BTC at ${order.price}`);
      }
    }
  }
}

import { StrategyAbstract } from '../strategy.abstract';
import { Interval } from '../../core/types';
import { Indicator } from '../../indicator/indicator';
import { Pair } from '../../core/structures/pair';
import { Logger } from '@nestjs/common';

/**
 * Demo Strategy
 * @author Yepeng Ding
 */
export class Demo extends StrategyAbstract {
  public name: string = Demo.name;
  private readonly logger = new Logger(Demo.name);

  // Strategy configuration
  private config = {
    pair: new Pair('BTC', 'USDT'),
    size: 1,
    interval: '30m' as Interval,
  };

  async init(): Promise<void> {
    const order = await this.broker
      .placeMarketLong(this.config.pair, this.config.size)
      .catch(() => null);
    if (order) {
      this.logger.log(`Long ${this.config.size} BTC at ${order.price}`);
    }
  }

  async next(): Promise<void> {
    const kLines = await this.broker.getKLines(
      this.config.pair,
      this.config.interval,
    );
    // Strategy only executes when the number of the received K-lines >= 10
    if (kLines.length < 10) {
      return;
    }

    const position = await this.broker.getPosition(this.config.pair);
    const { lower } = Indicator.BollingerBands(kLines.close, 10, 2);

    if (
      position &&
      kLines.at(-1).close > lower.at(-1) &&
      kLines.at(-1).close > position.entryPrice
    ) {
      const order = await this.broker
        .placeMarketShort(this.config.pair, this.config.size)
        .catch(() => null);
      if (order) {
        this.logger.log(`Short ${this.config.size} BTC at ${order.price}`);
      }
    }
  }
}

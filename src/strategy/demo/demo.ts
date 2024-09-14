import { StrategyAbstract } from '../strategy.abstract';
import { Interval } from '../../core/types';
import { Indicator } from '../../indicator/indicator';
import { PerpetualPair } from '../../core/structures/pair';
import { Logger } from '@nestjs/common';

/**
 * Demo Strategy
 * @author Yepeng Ding
 */
export class Demo extends StrategyAbstract {
  public name: string = Demo.name;
  private readonly logger = new Logger(this.id);

  // Strategy configuration initialized by parsing arguments of `init`
  private config: {
    pair: PerpetualPair;
    size: number;
    interval: Interval;
  };

  async init(args: string): Promise<void> {
    const config: Config = JSON.parse(args);
    this.config = {
      pair: new PerpetualPair(config.base, config.quote),
      size: config.size,
      interval: config.interval as Interval,
    };
    const order = await this.broker.placeMarketLong(
      this.config.pair,
      this.config.size,
    );
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
      const order = await this.broker.placeMarketShort(
        this.config.pair,
        this.config.size,
      );
      if (order) {
        this.logger.log(`Short ${this.config.size} BTC at ${order.price}`);
      }
    }
  }
}

interface Config {
  base: string;
  quote: string;
  size: number;
  interval: string;
}

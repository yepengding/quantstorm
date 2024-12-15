import { StrategyAbstract } from '../strategy.abstract';
import { Interval } from '../../core/types';
import { Indicator } from '../../indicator/indicator';
import { PerpetualPair } from '../../core/structures/pair';
import { Logger } from '@nestjs/common';
import { Broker } from '../../core/interfaces/broker.interface';
import { BinancePerpBrokerService } from '../../broker/binance/perp/binance.perp.broker.service';
import { BinanceConfig } from '../../broker/binance/binance.interface';

/**
 * Demo Strategy
 * @author Yepeng Ding
 */
export class Demo extends StrategyAbstract {
  public readonly name: string = Demo.name;
  private readonly logger = new Logger(this.id);

  private broker: Broker;

  // Strategy configuration initialized by parsing arguments of `init`
  private config: {
    pair: PerpetualPair;
    size: number;
    interval: Interval;
  };

  async init(args: string): Promise<void> {
    const config: Config = JSON.parse(args);

    if (!!config) {
      if (!!config.credential) {
        this.broker = new BinancePerpBrokerService(
          config.credential,
          this.logger,
        );
      } else {
        // Set broker to backtest broker if no credential is given.
        this.broker = this.backtestBroker;
      }
      this.config = {
        pair: new PerpetualPair(config.base, config.quote),
        size: config.size,
        interval: config.interval as Interval,
      };
    } else {
      throw new Error('Invalid config');
    }

    const order = await this.broker.placeMarketLong(
      this.config.pair,
      this.config.size,
    );
    if (!!order) {
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
      if (!!order) {
        this.logger.log(`Short ${this.config.size} BTC at ${order.price}`);
      }
    }
  }
}

interface Config {
  credential: BinanceConfig;
  base: string;
  quote: string;
  size: number;
  interval: string;
}

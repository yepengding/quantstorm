import { StrategyAbstract } from '../strategy.abstract';

/**
 * Demo Strategy
 * @author Yepeng Ding
 */
export class Demo extends StrategyAbstract {
  private position: {
    size: number;
    entryPrice: number;
  };

  async init(): Promise<void> {
    const order = await this.broker.placeMarketLong('BTC', 1).catch(() => null);
    if (order) {
      console.log(`Long 1 BTC at ${order.price}`);
    }
    this.position = {
      size: order.size,
      entryPrice: order.price,
    };
  }

  async next(): Promise<void> {
    const kLines = await this.broker.getKLines('BTC');
    // Strategy only executes when the number of the received K-lines >= 10
    if (kLines.length < 10) {
      return;
    }

    if (
      this.position.size > 0 &&
      kLines.at(-1).close > this.position.entryPrice
    ) {
      const order = await this.broker
        .placeMarketShort('BTC', 1)
        .catch(() => null);
      if (order) {
        this.position.size = 0.0;
        console.log(`Short 1 BTC at ${order.price}`);
      }
    }
  }
}

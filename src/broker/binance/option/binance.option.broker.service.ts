import { Injectable, Logger } from '@nestjs/common';
import { binance, Greeks as CCXTGreeks } from 'ccxt';
import { BinanceConfig } from '../binance.interface';
import { BinanceOptionBroker } from './binance.option.broker.interface';
import { Greeks, Order } from 'src/core/interfaces/market.interface';
import { Currency, OptionPair, Pair } from 'src/core/structures/pair';
import { Interval } from 'src/core/types';
import { KLines } from '../../../core/structures/klines';

/**
 * Binance Option Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinanceOptionBrokerService implements BinanceOptionBroker {
  private readonly logger: Logger;

  private readonly exchange: binance;

  constructor(config: BinanceConfig, logger: Logger) {
    this.exchange = new binance({
      ...config,
      enableRateLimit: true,
      options: { defaultType: 'option' },
    });
    this.logger = logger;
  }
  async getGreeks(pair: OptionPair): Promise<Greeks | null> {
    const greeks = await this.exchange
      .fetchGreeks(pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    console.log(greeks);
    return !!greeks ? this.toGreeks(greeks) : null;
  }

  async getAllGreeks(): Promise<Greeks[]> {
    const allGreeks = await this.exchange.fetchAllGreeks().catch((e) => {
      this.logger.error(e);
      return null;
    });
    return !!allGreeks ? Object.values(allGreeks).map(this.toGreeks) : [];
  }

  cancelOrder(id: string, pair: Pair): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  cancelOrders(ids: string[], pair: Pair): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async getBalance(currency: Currency): Promise<number | null> {
    return null;
  }
  async getMarketPrice(pair: OptionPair): Promise<number | null> {
    const greeks = await this.getGreeks(pair);
    return !!greeks ? greeks.price : null;
  }
  async getKLines(
    pair: OptionPair,
    interval: Interval,
    limit?: number,
  ): Promise<KLines> {
    const kLines = await this.exchange
      .fetchOHLCV(pair.toOptionSymbol(), interval, undefined, limit)
      .catch((e) => {
        this.logger.error(e);
        return [];
      });
    return new KLines(
      kLines.map((ohlcv) => {
        return {
          open: ohlcv[1],
          high: ohlcv[2],
          low: ohlcv[3],
          close: ohlcv[4],
          volume: ohlcv[5],
          timestamp: ohlcv[0],
        };
      }),
    );
  }
  async getBestBid(pair: OptionPair): Promise<number | null> {
    const orderBook = await this.exchange
      .fetchOrderBook(pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!orderBook ? orderBook.bids[0][0] : null;
  }
  async getBestAsk(pair: OptionPair): Promise<number | null> {
    const orderBook = await this.exchange
      .fetchOrderBook(pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!orderBook ? orderBook.asks[0][0] : null;
  }
  getOpenOrders(pair: Pair): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }
  getOrder(id: string, pair: Pair, logRaw?: boolean): Promise<Order | null> {
    throw new Error('Method not implemented.');
  }

  private toGreeks(greeks: CCXTGreeks): Greeks {
    return {
      symbol: greeks.symbol,
      price: greeks.markPrice,
      delta: greeks.delta,
      gamma: greeks.gamma,
      theta: greeks.theta,
      vega: greeks.vega,
    } as Greeks;
  }
}

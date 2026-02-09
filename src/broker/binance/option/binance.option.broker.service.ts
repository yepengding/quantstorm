import { Injectable, Logger } from '@nestjs/common';
import { binance, Greeks as CCXTGreeks, Order as CCXTOrder } from 'ccxt';
import { BinanceConfig } from '../binance.interface';
import { BinanceOptionBroker } from './binance.option.broker.interface';
import { KLines } from '../../../core/structures/klines';
import {
  OptionSide,
  OrderStatus,
  OrderType,
  TradeSide,
} from '../../../core/constants';
import { Currency, OptionPair } from '../../../core/structures/pair';
import { Greeks, Order } from '../../../core/interfaces/market.interface';
import { Interval } from '../../../core/types';

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

  async placeLimitBuy(
    pair: OptionPair,
    size: number,
    price: number,
  ): Promise<Order | null> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toOptionSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async placeLimitSell(
    pair: OptionPair,
    size: number,
    price: number,
  ): Promise<Order | null> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toOptionSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async cancelOrder(id: string, pair: OptionPair): Promise<boolean> {
    let order = await this.exchange
      .cancelOrder(id, pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    if (!order) {
      order = await this.exchange.fetchOrder(id, pair.toOptionSymbol());
      if (!order) {
        return false;
      }
    }
    return order.status == 'canceled';
  }

  async getGreeks(pair: OptionPair): Promise<Greeks | null> {
    const greeks = await this.exchange
      .fetchGreeks(pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!greeks ? this.toGreeks(greeks) : null;
  }

  async getAllGreeks(): Promise<Greeks[]> {
    const allGreeks = await this.exchange.fetchAllGreeks().catch((e) => {
      this.logger.error(e);
      return null;
    });
    return !!allGreeks ? Object.values(allGreeks).map(this.toGreeks) : [];
  }

  async getPairGreeks(
    base: Currency,
    quote: Currency,
    side?: OptionSide,
  ): Promise<Greeks[]> {
    const allGreeks = await this.getAllGreeks();
    return !!side
      ? allGreeks.filter(
          (g) =>
            g.symbol.startsWith(`${base}/${quote}:${quote}`) &&
            g.symbol.endsWith(side),
        )
      : allGreeks.filter((g) =>
          g.symbol.startsWith(`${base}/${quote}:${quote}`),
        );
  }

  async getExercisePrice(pair: OptionPair): Promise<number[]> {
    const exerciseHistory = await this.exchange
      .fetchMySettlementHistory(pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!exerciseHistory ? exerciseHistory.map((e) => e.price) : [];
  }

  async getBalance(currency: Currency): Promise<number | null> {
    const account = await this.exchange
      .eapiPrivateGetMarginAccount()
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    const asset = account?.asset.find((a) => a.asset == currency);

    return !!asset ? asset.available : null;
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
    return !!orderBook && orderBook.bids.length > 0
      ? orderBook.bids[0][0]
      : null;
  }
  async getBestAsk(pair: OptionPair): Promise<number | null> {
    const orderBook = await this.exchange
      .fetchOrderBook(pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!orderBook && orderBook.asks.length > 0
      ? orderBook.asks[0][0]
      : null;
  }

  async getOpenOrders(pair: OptionPair): Promise<Order[]> {
    const orders = await this.exchange
      .fetchOpenOrders(pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return [];
      });

    return orders.map((o) => this.toOrder(o));
  }
  async getOrder(
    id: string,
    pair: OptionPair,
    logRaw?: boolean,
  ): Promise<Order | null> {
    const order = await this.exchange
      .fetchOrder(id, pair.toOptionSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    if (!!order) {
      return this.toOrder(order);
    }

    if (logRaw && !order) {
      this.logger.debug(!!order ? JSON.stringify(order) : 'Order not found');
    }
    return null;
  }

  async getOrders(pair: OptionPair): Promise<Order[]> {
    const orders = await this.exchange
      .fetchOrders(pair.toOptionSymbol())
      .catch(() => []);
    return orders.map(this.toOrder);
  }

  private toGreeks(greeks: CCXTGreeks): Greeks {
    return {
      symbol: greeks.symbol,
      price: greeks.markPrice,
      delta: greeks.delta,
      gamma: greeks.gamma,
      theta: greeks.theta,
      vega: greeks.vega,
      bidIV: greeks.bidImpliedVolatility,
      askIV: greeks.askImpliedVolatility,
    } as Greeks;
  }

  private toOrder(order: CCXTOrder): Order {
    let orderType: OrderType;
    switch (order.type) {
      case 'limit': {
        orderType = OrderType.LIMIT;
        break;
      }
      case 'market': {
        orderType = OrderType.MARKET;
        break;
      }
      default:
        orderType = OrderType.LIMIT;
    }

    let orderStatus: OrderStatus;
    switch (order.status) {
      case 'open': {
        orderStatus = OrderStatus.OPEN;
        break;
      }
      case 'closed': {
        // CCXT defines "An order can be closed (filled) with multiple opposing trades"
        orderStatus = OrderStatus.FILLED;
        break;
      }
      default: {
        if (order.filled > 0) {
          orderStatus = OrderStatus.FILLED;
          this.logger.warn(
            `Unknown filled order (${order.id}) status ${order.status}`,
          );
        }
        orderStatus = OrderStatus.CANCELLED;
        if (order.status != 'canceled' && order.status != 'expired') {
          this.logger.warn(
            `Unknown status (${order.status}) of order (${order.id})`,
          );
        }
      }
    }
    return {
      id: order.id,
      type: orderType,
      symbol: order.symbol,
      price: order.price,
      size: order.amount,
      filledSize: order.filled,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: order.timestamp,
      status: orderStatus,
    };
  }
}

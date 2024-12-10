import { BinancePerpBroker } from './binance.perp.broker.interface';
import { Injectable, Logger } from '@nestjs/common';
import { PerpetualPair } from '../../../core/structures/pair';
import { Interval } from '../../../core/types';
import { KLines } from '../../../core/structures/klines';
import { binance, Order as CCXTOrder } from 'ccxt';
import { ConfigService } from '@nestjs/config';
import { Order } from '../../../core/interfaces/market.interface';
import {
  Currency,
  OrderStatus,
  OrderType,
  TradeSide,
} from '../../../core/constants';
import { Position } from '../../../core/interfaces/broker.interface';
import { BinanceConfig } from '../../binance.interface';

/**
 * Backtest Perpetual Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinancePerpBrokerService implements BinancePerpBroker {
  private readonly logger = new Logger(BinancePerpBrokerService.name);

  private readonly exchange: binance;

  constructor(private readonly configService: ConfigService) {
    this.exchange = new binance(
      this.configService.get<BinanceConfig>('binance'),
    );
  }

  async placeMarketLong(pair: PerpetualPair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketBuyOrder(pair.toPerpetualSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeMarketShort(pair: PerpetualPair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketSellOrder(pair.toPerpetualSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeLimitLong(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toPerpetualSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeLimitShort(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toPerpetualSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeGTXLong(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toPerpetualSymbol(), size, price, {
        timeInForce: 'PO',
      })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeGTXShort(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toPerpetualSymbol(), size, price, {
        timeInForce: 'PO',
      })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeStopMarketLong(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const marketPrice = await this.getMarketPrice(pair);
    let order;
    if (price > marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toPerpetualSymbol(),
          'STOP_MARKET',
          'buy',
          size,
          undefined,
          {
            stopPrice: price,
          },
        )
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
    } else if (price < marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toPerpetualSymbol(),
          'TAKE_PROFIT_MARKET',
          'buy',
          size,
          undefined,
          {
            stopPrice: price,
          },
        )
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
    }
    return order ? this.toOrder(order) : null;
  }

  async placeStopMarketShort(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const marketPrice = await this.getMarketPrice(pair);
    let order;
    if (price > marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toPerpetualSymbol(),
          'TAKE_PROFIT_MARKET',
          'sell',
          size,
          undefined,
          {
            stopPrice: price,
          },
        )
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
    } else if (price < marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toPerpetualSymbol(),
          'STOP_MARKET',
          'sell',
          size,
          undefined,
          {
            stopPrice: price,
          },
        )
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
    }
    return order ? this.toOrder(order) : null;
  }

  async cancelOrder(id: string, pair: PerpetualPair): Promise<boolean> {
    let order = await this.exchange
      .cancelOrder(id, pair.toPerpetualSymbol())
      .catch(() => null);
    if (!order) {
      order = await this.exchange.fetchOrder(id, pair.toPerpetualSymbol());
      if (!order) {
        return false;
      }
    }
    return order.status == 'canceled';
  }

  async cancelOrders(ids: string[], pair: PerpetualPair): Promise<boolean> {
    const orders = await this.exchange
      .cancelOrders(ids, pair.toPerpetualSymbol())
      .catch(() => null);
    return !!orders && !orders.some((order) => order.status != 'canceled');
  }

  async getBalance(currency: Currency): Promise<number> {
    const balances = await this.exchange
      .fetchBalance({ type: 'future' })
      .catch(() => null);
    return balances ? balances[currency].total : null;
  }

  async getKLines(
    pair: PerpetualPair,
    interval: Interval,
    limit?: number,
  ): Promise<KLines> {
    const kLines = await this.exchange.fetchOHLCV(
      pair.toPerpetualSymbol(),
      interval,
      undefined,
      limit,
    );
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

  async getMarketPrice(pair: PerpetualPair): Promise<number> {
    const symbol = pair.toPerpetualSymbol();
    const prices = await this.exchange
      .fetchLastPrices([symbol])
      .catch(() => null);
    return prices ? prices[symbol].price : null;
  }

  async getBestBid(pair: PerpetualPair): Promise<number> {
    const symbol = pair.toPerpetualSymbol();
    const ba = await this.exchange.fetchBidsAsks([symbol]).catch(() => null);
    return !!ba ? ba[symbol].bid : null;
  }

  async getBestAsk(pair: PerpetualPair): Promise<number> {
    const symbol = pair.toPerpetualSymbol();
    const ba = await this.exchange.fetchBidsAsks([symbol]).catch(() => null);
    return !!ba ? ba[symbol].ask : null;
  }

  async getOrder(id: string, pair: PerpetualPair): Promise<Order> {
    const order = await this.exchange
      .fetchOrder(id, pair.toPerpetualSymbol())
      .catch(() => null);
    return order ? this.toOrder(order) : null;
  }

  async getPosition(pair: PerpetualPair): Promise<Position> {
    const symbol = pair.toPerpetualSymbol();
    const positions = await this.exchange
      .fetchPositions([symbol])
      .catch(() => null);

    return positions && positions.length > 0
      ? {
          entryPrice: positions[0].entryPrice,
          size: positions[0].contracts,
          side: positions[0].side == 'long' ? TradeSide.LONG : TradeSide.SHORT,
          unrealizedPnL: positions[0].unrealizedPnl,
        }
      : null;
  }

  async getOpenOrders(pair: PerpetualPair): Promise<Order[]> {
    const orders = await this.exchange.fetchOpenOrders(
      pair.toPerpetualSymbol(),
    );
    return orders.map((o) => this.toOrder(o));
  }

  async getOrders(pair: PerpetualPair): Promise<Order[]> {
    const orders = await this.exchange.fetchOrders(pair.toPerpetualSymbol());
    return orders.map((o) => this.toOrder(o));
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
      case 'stop_market': {
        orderType = OrderType.TRIGGER;
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
        if (order.amount <= order.filled) {
          orderStatus = OrderStatus.FILLED;
        } else {
          orderStatus = OrderStatus.OPEN;
        }
        break;
      }
      default: {
        orderStatus = OrderStatus.CANCELLED;
      }
    }
    return {
      id: order.id,
      type: orderType,
      symbol: PerpetualPair.fromSymbol(order.symbol).toSymbol(),
      price: orderType != OrderType.TRIGGER ? order.price : order.triggerPrice,
      size: order.amount,
      filledSize: order.filled,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: order.timestamp,
      status: orderStatus,
    };
  }
}

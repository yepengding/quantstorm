import { Injectable, Logger } from '@nestjs/common';
import { PerpetualPair } from '../../../core/structures/pair';
import { Interval } from '../../../core/types';
import { KLines } from '../../../core/structures/klines';
import { bybit, Order as CCXTOrder } from 'ccxt';
import { Order } from '../../../core/interfaces/market.interface';
import {
  Currency,
  OrderStatus,
  OrderType,
  TradeSide,
} from '../../../core/constants';
import { Position } from '../../../core/interfaces/broker.interface';
import { BybitConfig } from '../bybit.interface';
import { BybitPerpBroker } from './bybit.perp.broker.interface';

/**
 * Bybit Perpetual Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BybitPerpBrokerService implements BybitPerpBroker {
  private readonly logger: Logger;

  private readonly exchange: bybit;

  constructor(config: BybitConfig, logger: Logger) {
    this.exchange = new bybit(config);
    this.logger = logger;
  }

  async placeMarketLong(pair: PerpetualPair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketBuyOrder(pair.toPerpetualSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });

    return !!order ? await this.getOrder(order.id, pair) : null;
  }

  async placeMarketShort(pair: PerpetualPair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketSellOrder(pair.toPerpetualSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? await this.getOrder(order.id, pair) : null;
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
    return !!order ? await this.getOrder(order.id, pair) : null;
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
    return !!order ? await this.getOrder(order.id, pair) : null;
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
    return !!order ? await this.getOrder(order.id, pair) : null;
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
    return !!order ? await this.getOrder(order.id, pair) : null;
  }

  async placeStopMarketLong(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createOrder(pair.toPerpetualSymbol(), 'market', 'buy', size, undefined, {
        triggerDirection: 'above',
        triggerPrice: price,
      })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? await this.getOrder(order.id, pair) : null;
  }

  async placeStopMarketShort(
    pair: PerpetualPair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createOrder(
        pair.toPerpetualSymbol(),
        'market',
        'sell',
        size,
        undefined,
        {
          triggerDirection: 'below',
          triggerPrice: price,
        },
      )
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? await this.getOrder(order.id, pair) : null;
  }

  async cancelOrder(id: string, pair: PerpetualPair): Promise<boolean> {
    const order = await this.exchange
      .cancelOrder(id, pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order && order.id == id;
  }

  async cancelOrders(ids: string[], pair: PerpetualPair): Promise<boolean> {
    let result = true;
    for (let i = 0; i < Math.ceil(ids.length / 10); i++) {
      const orders = await this.exchange
        .cancelOrders(
          ids.slice(i * 10, Math.min(ids.length, (i + 1) * 10)),
          pair.toPerpetualSymbol(),
        )
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
      result = result && !!orders && orders.length == ids.length;
    }
    return result;
  }

  async getBalance(currency: Currency): Promise<number> {
    const balances = await this.exchange
      .fetchBalance({ type: 'future' })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return balances ? balances[currency].total : null;
  }

  async getKLines(
    pair: PerpetualPair,
    interval: Interval,
    limit?: number,
  ): Promise<KLines> {
    const kLines = await this.exchange
      .fetchOHLCV(pair.toPerpetualSymbol(), interval, undefined, limit)
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

  async getMarketPrice(pair: PerpetualPair): Promise<number | null> {
    const ticker = await this.exchange
      .fetchTicker(pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!ticker ? ticker.last : null;
  }

  async getBestBid(pair: PerpetualPair): Promise<number> {
    const ticker = await this.exchange
      .fetchTicker(pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!ticker ? ticker.bid : null;
  }

  async getBestAsk(pair: PerpetualPair): Promise<number> {
    const ticker = await this.exchange
      .fetchTicker(pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!ticker ? ticker.ask : null;
  }

  async getOrder(id: string, pair: PerpetualPair): Promise<Order> {
    let order = await this.exchange
      .fetchOpenOrder(id, pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    if (!order) {
      const orders = await this.exchange
        .fetchCanceledAndClosedOrders(pair.toPerpetualSymbol(), null, null, {
          orderId: id,
        })
        .catch(() => []);
      if (orders.length == 1 && orders[0].id == id) {
        order = orders[0];
      }
    }

    return !!order ? this.toOrder(order) : null;
  }

  async getPosition(pair: PerpetualPair): Promise<Position | null> {
    const symbol = pair.toPerpetualSymbol();

    const position = await this.exchange.fetchPosition(symbol).catch((e) => {
      this.logger.error(e);
      return null;
    });

    return !!position && !!position.side
      ? {
          entryPrice: position.entryPrice,
          size: position.contracts,
          side: position.side == 'long' ? TradeSide.LONG : TradeSide.SHORT,
          unrealizedPnL: position.unrealizedPnl,
          liquidationPrice: position.liquidationPrice,
        }
      : null;
  }

  async getOpenOrders(pair: PerpetualPair): Promise<Order[]> {
    const orders = await this.exchange
      .fetchOpenOrders(pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return [];
      });
    return orders.map((o) => this.toOrder(o));
  }

  async getOrders(pair: PerpetualPair): Promise<Order[]> {
    const openOrders = await this.exchange
      .fetchOpenOrders(pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return [];
      });
    const cancelledAndClosedOrders = await this.exchange
      .fetchCanceledAndClosedOrders(pair.toPerpetualSymbol())
      .catch((e) => {
        this.logger.error(e);
        return [];
      });
    return openOrders
      .concat(cancelledAndClosedOrders)
      .map((o) => this.toOrder(o));
  }

  private toOrder(order: CCXTOrder): Order {
    let orderType: OrderType = OrderType.LIMIT;
    if (order.type == 'market') {
      orderType = !!order.triggerPrice ? OrderType.TRIGGER : OrderType.MARKET;
    } else if (order.type != 'limit') {
      this.logger.warn(`Unknown type (${order.type}) of order (${order.id})`);
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
    let price = order.price;
    if (orderType == OrderType.TRIGGER) {
      price = order.triggerPrice;
    } else if (orderType == OrderType.MARKET) {
      price = order.average;
    }
    return {
      id: order.id,
      type: orderType,
      symbol: PerpetualPair.fromSymbol(order.symbol).toSymbol(),
      price: price,
      size: order.amount,
      filledSize: order.filled,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: order.timestamp,
      status: orderStatus,
    };
  }
}

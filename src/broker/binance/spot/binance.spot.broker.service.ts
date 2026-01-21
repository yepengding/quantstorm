import { Injectable, Logger } from "@nestjs/common";
import { BasePair, Currency } from "../../../core/structures/pair";
import { Interval } from "../../../core/types";
import { KLines } from "../../../core/structures/klines";
import { binance, Order as CCXTOrder } from "ccxt";
import { Order } from "../../../core/interfaces/market.interface";
import { OrderStatus, OrderType, TradeSide } from "../../../core/constants";
import { BinanceConfig } from "../binance.interface";
import { BinanceSpotBroker } from "./binance.spot.broker.interface";

/**
 * Binance Spot Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinanceSpotBrokerService implements BinanceSpotBroker {
  private readonly logger: Logger;

  private readonly exchange: binance;

  constructor(config: BinanceConfig, logger: Logger) {
    this.exchange = new binance(config);
    this.logger = logger;
  }

  async placeMarketBuy(pair: BasePair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketBuyOrder(pair.toSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async placeMarketSell(pair: BasePair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketSellOrder(pair.toSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async placeLimitBuy(
    pair: BasePair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async placeLimitSell(
    pair: BasePair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async placeGTXBuy(
    pair: BasePair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toSymbol(), size, price, {
        timeInForce: 'PO',
      })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async placeGTXSell(
    pair: BasePair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toSymbol(), size, price, {
        timeInForce: 'PO',
      })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!order ? this.toOrder(order) : null;
  }

  async placeStopMarketBuy(
    pair: BasePair,
    size: number,
    price: number,
  ): Promise<Order> {
    const marketPrice = await this.getMarketPrice(pair);
    let order;
    if (price > marketPrice) {
      order = await this.exchange
        .createOrder(pair.toSymbol(), 'STOP_MARKET', 'buy', size, undefined, {
          stopPrice: price,
        })
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
    } else if (price < marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toSymbol(),
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
    return !!order ? this.toOrder(order) : null;
  }

  async placeStopMarketSell(
    pair: BasePair,
    size: number,
    price: number,
  ): Promise<Order> {
    const marketPrice = await this.getMarketPrice(pair);
    let order;
    if (price > marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toSymbol(),
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
        .createOrder(pair.toSymbol(), 'STOP_MARKET', 'sell', size, undefined, {
          stopPrice: price,
        })
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
    }
    return !!order ? this.toOrder(order) : null;
  }

  async cancelOrder(id: string, pair: BasePair): Promise<boolean> {
    let order = await this.exchange
      .cancelOrder(id, pair.toSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    if (!order) {
      order = await this.exchange.fetchOrder(id, pair.toSymbol());
      if (!order) {
        return false;
      }
    }
    return order.status == 'canceled';
  }

  async cancelConditionalOrder(id: string, pair: BasePair): Promise<boolean> {
    let order = await this.exchange
      .cancelOrder(id, pair.toSymbol(), { trigger: true })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    if (!order) {
      order = await this.exchange.fetchOrder(id, pair.toSymbol(), {
        trigger: true,
      });
      if (!order) {
        return false;
      }
    }
    return order.status == 'canceled';
  }

  async cancelOrders(ids: string[], pair: BasePair): Promise<boolean> {
    let result = true;
    for (let i = 0; i < Math.ceil(ids.length / 10); i++) {
      const orders = await this.exchange
        .cancelOrders(
          ids.slice(i * 10, Math.min(ids.length, (i + 1) * 10)),
          pair.toSymbol(),
        )
        .catch((e) => {
          this.logger.error(e);
          return null;
        });
      result =
        result &&
        !!orders &&
        !orders.some((order) => order.status != 'canceled');
    }
    return result;
  }

  async cancelConditionalOrders(
    ids: string[],
    pair: BasePair,
  ): Promise<boolean> {
    let result = true;
    for (let i = 0; i < ids.length; i++) {
      result = result && (await this.cancelConditionalOrder(ids[i], pair));
    }
    return result;
  }

  async getBalance(currency: Currency): Promise<number> {
    const balances = await this.exchange.fetchBalance().catch((e) => {
      this.logger.error(e);
      return null;
    });
    return !!balances ? balances[currency].total : null;
  }

  async getKLines(
    pair: BasePair,
    interval: Interval,
    limit?: number,
  ): Promise<KLines> {
    const kLines = await this.exchange
      .fetchOHLCV(pair.toSymbol(), interval, undefined, limit)
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

  async getMarketPrice(pair: BasePair): Promise<number> {
    const ticker = await this.exchange
      .fetchTicker(pair.toSymbol())
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return !!ticker ? ticker.last : null;
  }

  async getBestBid(pair: BasePair): Promise<number> {
    const symbol = pair.toSymbol();
    const ba = await this.exchange.fetchBidsAsks([symbol]).catch((e) => {
      this.logger.error(e);
      return null;
    });
    return !!ba ? ba[symbol].bid : null;
  }

  async getBestAsk(pair: BasePair): Promise<number> {
    const symbol = pair.toSymbol();
    const ba = await this.exchange.fetchBidsAsks([symbol]).catch((e) => {
      this.logger.error(e);
      return null;
    });
    return !!ba ? ba[symbol].ask : null;
  }

  async getOrder(
    id: string,
    pair: BasePair,
    logRaw: boolean = false,
  ): Promise<Order> {
    const order = await this.exchange
      .fetchOrder(id, pair.toSymbol())
      .catch((e) => {
        return null;
      });
    if (!!order) {
      return this.toOrder(order);
    }
    const conditionalOrder = await this.exchange
      .fetchOrder(id, pair.toSymbol(), { trigger: true })
      .catch((e) => {
        return null;
      });
    if (!!conditionalOrder) {
      return this.toOrder(conditionalOrder);
    }

    if (logRaw && !order && !conditionalOrder) {
      this.logger.debug(!!order ? JSON.stringify(order) : 'Order not found');
    }
    return null;
  }

  async getOpenOrders(pair: BasePair): Promise<Order[]> {
    const orders = await this.exchange
      .fetchOpenOrders(pair.toSymbol())
      .catch((e) => {
        this.logger.error(e);
        return [];
      });

    return orders.map((o) => this.toOrder(o));
  }

  async getOpenConditionalOrders(pair: BasePair): Promise<Order[]> {
    const conditionalOrders = await this.exchange
      .fetchOpenOrders(pair.toSymbol(), null, null, { trigger: true })
      .catch(() => []);
    return conditionalOrders.map((o) => this.toOrder(o));
  }

  async getOrders(pair: BasePair): Promise<Order[]> {
    const orders = await this.exchange
      .fetchOrders(pair.toSymbol())
      .catch(() => []);
    const conditionalOrders = await this.exchange
      .fetchOrders(pair.toSymbol(), null, null, { trigger: true })
      .catch(() => []);
    return orders.concat(conditionalOrders).map((o) => this.toOrder(o));
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

    if (!order.type && !!order.triggerPrice) {
      orderType = OrderType.TRIGGER;
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
      symbol: BasePair.fromSymbol(order.symbol).toSymbol(),
      price: orderType != OrderType.TRIGGER ? order.price : order.triggerPrice,
      size: order.amount,
      filledSize: order.filled,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: order.timestamp,
      status: orderStatus,
    };
  }
}

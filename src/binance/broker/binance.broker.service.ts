import { BinanceBroker, BinanceConfig } from './binance.broker.interface';
import { Injectable, Logger } from '@nestjs/common';
import { Pair } from '../../core/structures/pair';
import { Interval } from '../../core/types';
import { KLines } from '../../core/structures/klines';
import { binance, Order as CCXTOrder } from 'ccxt';
import { ConfigService } from '@nestjs/config';
import { Order } from '../../core/interfaces/market.interface';
import {
  Currency,
  OrderStatus,
  OrderType,
  TradeSide,
} from '../../core/constants';
import { Position } from '../../core/interfaces/broker.interface';

/**
 * Backtest Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinanceBrokerService implements BinanceBroker {
  private readonly logger = new Logger(BinanceBrokerService.name);

  private readonly exchange: binance;

  constructor(private readonly configService: ConfigService) {
    this.exchange = new binance(
      this.configService.get<BinanceConfig>('binance'),
    );
  }

  async placeMarketLong(pair: Pair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketBuyOrder(pair.toBinanceFuturesSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeMarketShort(pair: Pair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketSellOrder(pair.toBinanceFuturesSymbol(), size)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeLimitLong(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toBinanceFuturesSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeLimitShort(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toBinanceFuturesSymbol(), size, price)
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeGTXLong(pair: Pair, size: number, price: number): Promise<Order> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toBinanceFuturesSymbol(), size, price, {
        timeInForce: 'PO',
      })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeGTXShort(pair: Pair, size: number, price: number): Promise<Order> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toBinanceFuturesSymbol(), size, price, {
        timeInForce: 'PO',
      })
      .catch((e) => {
        this.logger.error(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  async placeStopMarketLong(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const marketPrice = await this.getMarketPrice(pair);
    let order;
    if (price > marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toBinanceFuturesSymbol(),
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
          pair.toBinanceFuturesSymbol(),
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
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const marketPrice = await this.getMarketPrice(pair);
    let order;
    if (price > marketPrice) {
      order = await this.exchange
        .createOrder(
          pair.toBinanceFuturesSymbol(),
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
          pair.toBinanceFuturesSymbol(),
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

  async cancelOrder(id: string, pair: Pair): Promise<boolean> {
    let order = await this.exchange
      .cancelOrder(id, pair.toBinanceFuturesSymbol())
      .catch(() => null);
    if (!order) {
      order = await this.exchange.fetchOrder(id, pair.toBinanceFuturesSymbol());
      if (!order) {
        return false;
      }
    }
    return order.status == 'canceled';
  }

  async getBalance(currency: Currency): Promise<number> {
    const balances = await this.exchange
      .fetchBalance({ type: 'future' })
      .catch(() => null);
    return balances ? balances[currency].total : null;
  }

  async getKLines(
    pair: Pair,
    interval: Interval,
    limit?: number,
  ): Promise<KLines> {
    const kLines = await this.exchange.fetchOHLCV(
      pair.toBinanceFuturesSymbol(),
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

  async getMarketPrice(pair: Pair): Promise<number> {
    const symbol = pair.toBinanceFuturesSymbol();
    const prices = await this.exchange
      .fetchLastPrices([symbol])
      .catch(() => null);
    return prices ? prices[symbol].price : null;
  }

  async getBestBid(pair: Pair): Promise<number> {
    const symbol = pair.toBinanceFuturesSymbol();
    const ba = await this.exchange.fetchBidsAsks([symbol]).catch(() => null);
    return !!ba ? ba[symbol].bid : null;
  }

  async getBestAsk(pair: Pair): Promise<number> {
    const symbol = pair.toBinanceFuturesSymbol();
    const ba = await this.exchange.fetchBidsAsks([symbol]).catch(() => null);
    return !!ba ? ba[symbol].ask : null;
  }

  async getOrder(id: string, pair: Pair): Promise<Order> {
    const order = await this.exchange
      .fetchOrder(id, pair.toBinanceFuturesSymbol())
      .catch(() => null);
    return order ? this.toOrder(order) : null;
  }

  async getPosition(pair: Pair): Promise<Position> {
    const symbol = pair.toBinanceFuturesSymbol();
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

  async getOrders(pair: Pair): Promise<Order[]> {
    const orders = await this.exchange.fetchOrders(
      pair.toBinanceFuturesSymbol(),
    );
    return orders.map((o) => this.toOrder(o));
  }

  private toOrder(order: CCXTOrder): Order {
    let status = OrderStatus.OPEN;
    if (order.status == 'open') {
      status = OrderStatus.OPEN;
    } else if (order.status == 'closed' && order.amount == order.filled) {
      status = OrderStatus.FILLED;
    } else if (order.status == 'canceled') {
      status = OrderStatus.CANCELLED;
    }
    return {
      id: order.id,
      type: order.type == 'limit' ? OrderType.LIMIT : OrderType.MARKET,
      symbol: Pair.fromBinanceFuturesSymbol(order.symbol).toSymbol(),
      price: order.price,
      size: order.amount,
      filledSize: order.filled,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: order.timestamp,
      status: status,
    };
  }
}

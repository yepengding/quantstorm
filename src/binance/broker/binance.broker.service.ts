import { BinanceBroker, BinanceConfig } from './binance.broker.interface';
import { Injectable } from '@nestjs/common';
import { Pair, SupportedCurrency } from '../../core/structures/pair';
import { Interval } from '../../core/types';
import { KLines } from '../../core/structures/klines';
import { binance, Order as CCXTOrder } from 'ccxt';
import { ConfigService } from '@nestjs/config';
import { Order } from '../../core/interfaces/market.interface';
import { OrderStatus, TradeSide } from '../../core/constants';
import { Position } from '../../core/interfaces/broker.interface';
import * as console from 'node:console';

/**
 * Backtest Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BinanceBrokerService implements BinanceBroker {
  private readonly exchange: binance;

  constructor(private readonly configService: ConfigService) {
    this.exchange = new binance(
      this.configService.get<BinanceConfig>('binance'),
    );
  }

  public async placeMarketLong(pair: Pair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketBuyOrder(pair.toBinanceFuturesSymbol(), size)
      .catch((e) => {
        console.log(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  public async placeMarketShort(pair: Pair, size: number): Promise<Order> {
    const order = await this.exchange
      .createMarketSellOrder(pair.toBinanceFuturesSymbol(), size)
      .catch((e) => {
        console.log(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  public async placeLimitLong(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitBuyOrder(pair.toBinanceFuturesSymbol(), size, price)
      .catch((e) => {
        console.log(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  public async placeLimitShort(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order = await this.exchange
      .createLimitSellOrder(pair.toBinanceFuturesSymbol(), size, price)
      .catch((e) => {
        console.log(e);
        return null;
      });
    return order ? this.toOrder(order) : null;
  }

  public async cancelOrder(id: string, pair: Pair): Promise<boolean> {
    const order = await this.exchange
      .cancelOrder(id, pair.toBinanceFuturesSymbol())
      .catch(() => null);
    if (!order) {
      return false;
    }
    return order.status == 'canceled';
  }

  public async getBalance(currency: SupportedCurrency): Promise<number> {
    const balances = await this.exchange
      .fetchBalance({ type: 'future' })
      .catch(() => null);
    return balances ? balances[currency].total : null;
  }

  public async getKLines(
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

  public async getMarketPrice(pair: Pair): Promise<number> {
    const symbol = pair.toBinanceFuturesSymbol();
    const prices = await this.exchange
      .fetchLastPrices([symbol])
      .catch(() => null);
    return prices ? prices[symbol].price : null;
  }

  public async getPosition(pair: Pair): Promise<Position> {
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

  private toOrder(order: CCXTOrder): Order {
    return {
      id: order.id,
      symbol: order.symbol,
      price: order.price,
      size: order.amount,
      filledSize: order.filled,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: order.timestamp,
      status: OrderStatus.FILLED,
    };
  }
}

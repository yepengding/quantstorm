import { Injectable, Logger } from '@nestjs/common';
import { PerpetualPair } from '../../../core/structures/pair';
import { Interval } from '../../../core/types';
import { KLines } from '../../../core/structures/klines';
import { bitget, Order as CCXTOrder } from 'ccxt';
import { ConfigService } from '@nestjs/config';
import { Order } from '../../../core/interfaces/market.interface';
import {
  Currency,
  OrderStatus,
  OrderType,
  TradeSide,
} from '../../../core/constants';
import { Position } from '../../../core/interfaces/broker.interface';
import { BitgetPerpBroker } from './bitget.perp.broker.interface';
import { BitgetConfig } from '../../bitget.interface';

/**
 * Bitget Perpetual Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BitgetPerpBrokerService implements BitgetPerpBroker {
  private readonly logger = new Logger(BitgetPerpBrokerService.name);

  private readonly exchange: bitget;

  constructor(private readonly configService: ConfigService) {
    this.exchange = new bitget(this.configService.get<BitgetConfig>('bitget'));
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
    await this.exchange
      .cancelOrder(id, pair.toPerpetualSymbol())
      .catch(() => null);
    await this.exchange.privateMixPostV2MixOrderCancelPlanOrder({
      orderIdList: [{ orderId: id }],
      symbol: `${pair.base}${pair.quote}`,
      planType: 'normal_plan',
      productType: `${pair.quote}-FUTURES`,
    });
    const order = await this.getOrder(id, pair);
    if (!order) {
      return false;
    }
    return order.status === OrderStatus.CANCELLED;
  }

  async cancelOrders(ids: string[], pair: PerpetualPair): Promise<boolean> {
    await this.exchange
      .cancelOrders(ids, pair.toPerpetualSymbol())
      .catch(() => null);
    await this.exchange.privateMixPostV2MixOrderCancelPlanOrder({
      orderIdList: ids.map((id) => {
        return { orderId: id };
      }),
      symbol: `${pair.base}${pair.quote}`,
      planType: 'normal_plan',
      productType: `${pair.quote}-FUTURES`,
    });
    // TODO
    return true;
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
    const ticker = await this.exchange.fetchTicker(symbol).catch(() => null);
    return !!ticker ? ticker.last : null;
  }

  async getBestBid(pair: PerpetualPair): Promise<number> {
    const symbol = pair.toPerpetualSymbol();
    const ticker = await this.exchange.fetchTicker(symbol).catch(() => null);
    return !!ticker ? ticker.bid : null;
  }

  async getBestAsk(pair: PerpetualPair): Promise<number> {
    const symbol = pair.toPerpetualSymbol();
    const ticker = await this.exchange.fetchTicker(symbol).catch(() => null);
    return !!ticker ? ticker.ask : null;
  }

  async getOrder(id: string, pair: PerpetualPair): Promise<Order> {
    const order = await this.exchange
      .fetchOrder(id, pair.toPerpetualSymbol())
      .catch(() => null);
    if (!!order) {
      return this.toOrder(order);
    }

    // Check if the order is a pending trigger order
    const openTriggerOrder = await this.exchange
      .privateMixGetV2MixOrderOrdersPlanPending({
        orderId: id,
        symbol: `${pair.base}${pair.quote}`,
        planType: 'normal_plan',
        productType: `${pair.quote}-FUTURES`,
      })
      .then((res) => {
        if (
          !!res &&
          res.msg == 'success' &&
          !!res.data.entrustedList &&
          res.data.entrustedList.length == 1
        ) {
          return res.data.entrustedList[0];
        } else {
          return null;
        }
      });
    if (!!openTriggerOrder) {
      return this.triggerToOrder(openTriggerOrder, pair, true);
    }
    const closedTriggerOrder = await this.exchange
      .privateMixGetV2MixOrderOrdersPlanHistory({
        orderId: id,
        symbol: `${pair.base}${pair.quote}`,
        planType: 'normal_plan',
        productType: `${pair.quote}-FUTURES`,
      })
      .then((res) => {
        if (
          !!res &&
          res.msg == 'success' &&
          !!res.data.entrustedList &&
          res.data.entrustedList.length == 1
        ) {
          return res.data.entrustedList[0];
        } else {
          return null;
        }
      });
    if (!!closedTriggerOrder) {
      return this.triggerToOrder(closedTriggerOrder, pair, false);
    }
    return null;
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
    const openTriggerOrders = await this.exchange
      .privateMixGetV2MixOrderOrdersPlanPending({
        symbol: `${pair.base}${pair.quote}`,
        planType: 'normal_plan',
        productType: `${pair.quote}-FUTURES`,
      })
      .then((res) => {
        if (!!res && res.msg == 'success' && !!res.data.entrustedList) {
          return res.data.entrustedList;
        } else {
          return null;
        }
      });

    return [
      ...orders.map((o) => this.toOrder(o)),
      ...openTriggerOrders.map((o) => this.triggerToOrder(o, pair, true)),
    ];
  }

  private toOrder(order: CCXTOrder): Order {
    let status = OrderStatus.CANCELLED;
    if (order.status == 'open') {
      status = OrderStatus.OPEN;
    } else if (order.status == 'closed' && order.filled > 0) {
      status = OrderStatus.FILLED;
    } else if (
      order.status == 'expired' ||
      order.status == 'canceled' ||
      order.status == 'rejected'
    ) {
      status = OrderStatus.CANCELLED;
    } else {
      this.logger.warn(
        `Unknown status (${order.status}) of order (${order.id})`,
      );
    }
    return {
      id: order.id,
      type: order.type == 'limit' ? OrderType.LIMIT : OrderType.MARKET,
      symbol: PerpetualPair.fromSymbol(order.symbol).toSymbol(),
      price: order.price,
      size: order.amount,
      filledSize: order.filled,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: order.timestamp,
      status: status,
    };
  }

  private triggerToOrder(
    order: any,
    pair: PerpetualPair,
    isOpen: boolean,
  ): Order {
    return {
      id: order.orderId,
      type: order.orderType == 'limit' ? OrderType.LIMIT : OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: order.triggerPrice,
      size: Number(order.size),
      filledSize: order.planStatus == 'executed' ? Number(order.size) : 0,
      side: order.side == 'buy' ? TradeSide.LONG : TradeSide.SHORT,
      timestamp: Number(order.uTime),
      status: isOpen
        ? OrderStatus.OPEN
        : order.planStatus == 'executed'
          ? OrderStatus.FILLED
          : OrderStatus.CANCELLED,
    };
  }
}

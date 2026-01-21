import { Injectable } from '@nestjs/common';
import {
  DEFAULT_KLINE_LIMIT,
  OrderStatus,
  OrderType,
  TradeSide,
  TradeType,
} from '../../../core/constants';
import { Order, Trade } from '../../../core/interfaces/market.interface';
import { BacktestFeederService } from '../../../backtest/feeder/backtest.feeder.service';
import { Interval } from '../../../core/types';
import { toTimestampInterval } from '../../../backtest/backtest.utils';
import { KLines } from '../../../core/structures/klines';
import { History } from '../../../backtest/structures/history';
import { BasePair, Currency, Pair } from '../../../core/structures/pair';
import { BacktestResult } from '../../../backtest/structures/result';
import { BacktestConfig } from '../backtest.interface';
import { BacktestSpotBroker } from './backtest.spot.broker.interface';

/**
 * Backtest Spot Broker Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestSpotBrokerService implements BacktestSpotBroker {
  private readonly tick: number;
  private readonly commission: {
    taker: number;
    maker: number;
  };

  private orderIdCounter: number;
  private tradeIdCounter: number;
  private interval: Interval;
  private clockInterval: number;
  private currentClock: number;

  private readonly balances: Map<Currency, number>;
  private readonly orders: Map<string, Order>;
  private readonly history: History;

  private readonly feeder: BacktestFeederService;

  constructor(config: BacktestConfig) {
    this.tick = config.tick / 10000;
    this.commission = {
      maker: config.commission.maker / 10000,
      taker: config.commission.taker / 10000,
    };
    this.orderIdCounter = 0;
    this.tradeIdCounter = 0;
    // The initial clock is one day ago
    this.currentClock = Date.now() - 86400;
    this.balances = new Map<Currency, number>();
    this.orders = new Map<string, Order>();
    this.history = new History();
    this.feeder = new BacktestFeederService(config.feeder);
  }

  async placeMarketBuy(pair: Pair, size: number): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: await this.getMarketPrice(pair),
      size: pair.roundSize(size),
      filledSize: pair.roundSize(size),
      side: TradeSide.LONG,
      timestamp: this.currentClock,
      status: OrderStatus.FILLED,
    };
    this.orders.set(order.id, order);
    this.updateBalanceByFilledOrder(order);
    return order;
  }

  async placeMarketSell(pair: Pair, size: number): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: await this.getMarketPrice(pair),
      size: pair.roundSize(size),
      filledSize: pair.roundSize(size),
      side: TradeSide.SHORT,
      timestamp: this.currentClock,
      status: OrderStatus.FILLED,
    };
    this.orders.set(order.id, order);
    this.updateBalanceByFilledOrder(order);
    return order;
  }

  async placeLimitBuy(pair: Pair, size: number, price: number): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.LIMIT,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.LONG,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };
    const marketPrice = await this.getMarketPrice(pair);
    if (price >= marketPrice) {
      // If price >= market price, then place market long order
      order.price = marketPrice;
      order.filledSize = size;
      order.status = OrderStatus.FILLED;
      this.updateBalanceByFilledOrder(order);
    }

    this.orders.set(order.id, order);
    return order;
  }

  async placeLimitSell(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.LIMIT,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.SHORT,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };
    const marketPrice = await this.getMarketPrice(pair);
    if (price <= marketPrice) {
      // If price <= market price, then place market short order
      order.price = marketPrice;
      order.filledSize = size;
      order.status = OrderStatus.FILLED;
      this.updateBalanceByFilledOrder(order);
    }

    this.orders.set(order.id, order);
    return order;
  }

  async placeGTXBuy(pair: Pair, size: number, price: number): Promise<Order> {
    return await this.placeLimitBuy(pair, size, price);
  }

  async placeGTXSell(pair: Pair, size: number, price: number): Promise<Order> {
    return await this.placeLimitSell(pair, size, price);
  }

  async placeStopMarketBuy(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.LONG,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };

    this.orders.set(order.id, order);
    return order;
  }

  async placeStopMarketSell(
    pair: Pair,
    size: number,
    price: number,
  ): Promise<Order> {
    const order: Order = {
      id: this.orderId,
      type: OrderType.MARKET,
      symbol: pair.toSymbol(),
      price: price,
      size: pair.roundSize(size),
      filledSize: 0.0,
      side: TradeSide.SHORT,
      timestamp: this.currentClock,
      status: OrderStatus.OPEN,
    };

    this.orders.set(order.id, order);
    return order;
  }

  public async cancelOrder(id: string, pair: Pair): Promise<boolean> {
    const order = this.orders.get(id);
    if (!!order) {
      order.status = OrderStatus.CANCELLED;
      return true;
    } else {
      return false;
    }
  }

  public async cancelOrders(ids: string[], pair: Pair): Promise<boolean> {
    let ret = true;
    for (const id of ids) {
      ret = await this.cancelOrder(id, pair);
      if (!ret) {
        return false;
      }
    }
    return ret;
  }

  public async cancelConditionalOrder(
    id: string,
    pair: Pair,
  ): Promise<boolean> {
    return await this.cancelOrder(id, pair);
  }

  public async cancelConditionalOrders(
    ids: string[],
    pair: Pair,
  ): Promise<boolean> {
    return await this.cancelOrders(ids, pair);
  }

  async getBalance(currency: Currency): Promise<number> {
    return this.balances.get(currency);
  }

  async getMarketPrice(pair: Pair): Promise<number> {
    const kLines = await this.feeder.getBinanceKLines(
      pair,
      this.interval,
      this.clock,
      1,
    );
    if (kLines.length == 0) {
      throw new Error('Failed to get the market price.');
    }
    return kLines[0].close;
  }

  async getBestBid(pair: Pair): Promise<number> {
    return (await this.getMarketPrice(pair)) * (1 - this.tick);
  }

  async getBestAsk(pair: Pair): Promise<number> {
    return (await this.getMarketPrice(pair)) * (1 + this.tick);
  }

  async getOrder(id: string, pair: Pair): Promise<Order> {
    const order = this.orders.get(id);
    return order ? order : null;
  }

  // TODO
  async getOpenOrders(pair: Pair): Promise<Order[]> {
    return [];
  }

  // TODO
  async getOpenConditionalOrders(pair: Pair): Promise<Order[]> {
    return [];
  }

  async getKLines(
    pair: Pair,
    interval: Interval,
    limit: number = DEFAULT_KLINE_LIMIT,
  ): Promise<KLines> {
    const kLines = await this.feeder.getBinanceKLines(
      pair,
      interval,
      this.clock,
      limit,
    );

    return new KLines(
      kLines.length <= limit ? kLines : kLines.slice(kLines.length - limit),
    );
  }

  private updateBalanceByFilledOrder(order: Order): void {
    const pair = BasePair.fromSymbol(order.symbol);
    const base = pair.base;
    const quote = pair.quote;
    if (order.side === TradeSide.LONG) {
      this.balances.set(base, this.balances.get(base) + order.filledSize);
      this.balances.set(
        quote,
        this.balances.get(quote) - order.filledSize * order.price,
      );
    } else if (order.side === TradeSide.SHORT) {
      this.balances.set(base, this.balances.get(base) - order.filledSize);
      this.balances.set(
        quote,
        this.balances.get(quote) + order.filledSize * order.price,
      );
    }

    // Deduct commission fee from base token by the given filled order
    const fee =
      (order.type == OrderType.LIMIT
        ? this.commission.maker
        : this.commission.taker) * order.size;

    this.balances.set(base, this.balances.get(base) - fee);
    this.history.addTrade(this.toTrade(order, 0, fee));
  }

  setBalance(currency: Currency, amount: number): void {
    this.balances.set(currency, amount);
  }

  initClockAndInterval(clock: number, interval: Interval) {
    this.currentClock = clock;
    this.interval = interval;
    this.clockInterval = toTimestampInterval(interval);
    this.history.flush(this.currentClock, new Map(this.balances));
  }

  async nextClock() {
    this.currentClock += this.clockInterval;
    // Fill open orders
    for (const order of this.orders.values()) {
      if (order.status == OrderStatus.OPEN) {
        const kLine = (
          await this.getKLines(
            BasePair.fromSymbol(order.symbol),
            this.interval,
            1,
          )
        ).at(0);
        if (kLine.low <= order.price && order.price <= kLine.high) {
          // If the order price is between the low and high of the next K-line, then fill the limit order (place market order)
          order.filledSize = order.size;
          order.status = OrderStatus.FILLED;
          this.updateBalanceByFilledOrder(order);
        }
      }
    }
    // Update balances
    const balances = new Map<Currency, number>();
    for (const currency of this.balances.keys()) {
      balances.set(currency, await this.getBalance(currency));
    }

    // Flush history
    this.history.flush(this.currentClock, balances);
  }

  get clock() {
    return this.currentClock;
  }

  private get orderId() {
    return `${this.orderIdCounter++}`;
  }

  private get tradeId() {
    return `${this.tradeIdCounter++}`;
  }

  get backtestResult() {
    return new BacktestResult(this.history.allRecords);
  }

  private toTrade(order: Order, pnl: number, fee: number): Trade {
    return {
      id: this.tradeId,
      type: order.type == OrderType.LIMIT ? TradeType.MAKER : TradeType.TAKER,
      symbol: order.symbol,
      price: order.price,
      size: order.filledSize,
      side: order.side,
      timestamp: this.currentClock,
      pnl: pnl,
      fee: fee,
    };
  }
}

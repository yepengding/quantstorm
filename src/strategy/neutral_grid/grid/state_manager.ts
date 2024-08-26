import { BarState, BarStatus, GridConfig, GridState } from './types';
import { PerpetualPair } from '../../../core/structures/pair';
import { Order } from '../../../core/interfaces/market.interface';
import { TradeSide } from '../../../core/constants';

/**
 * Grid State Manager
 *
 * @author Yepeng Ding
 */
export class StateManager {
  private readonly config: GridConfig;

  private state: GridState;

  constructor(config: GridConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    const interval = this.config.pair.roundPrice(
      (this.config.upper - this.config.lower) / this.config.number,
    );
    const bars = new Map<number, BarState>();
    for (let i = 0; i < this.config.number; i++) {
      bars.set(i, {
        index: i,
        price: this.config.pair.roundPrice(this.config.lower + i * interval),
        long: {
          orderId: null,
          status: BarStatus.CLOSED,
        },
        short: {
          orderId: null,
          status: BarStatus.CLOSED,
        },
      });
    }
    bars.set(this.config.number, {
      index: this.config.number,
      price: this.config.upper,
      long: {
        orderId: null,
        status: BarStatus.CLOSED,
      },
      short: {
        orderId: null,
        status: BarStatus.CLOSED,
      },
    });
    this.state = {
      interval: interval,
      bars: bars,
      isTriggered: !this.config.triggerPrice,
      triggerRange: !!this.config.triggerPrice
        ? [
            this.config.triggerPrice - interval,
            this.config.triggerPrice + interval,
          ]
        : [this.config.lower - interval, this.config.upper + interval],
      stopOrders: {
        lower: null,
        upper: null,
      },
      position: 0.0,
      isTerminated: false,
    };
  }

  setBarOpening(index: number, orderId: string, side: TradeSide) {
    if (side == TradeSide.LONG) {
      this.state.bars.get(index).long = {
        orderId: orderId,
        status: BarStatus.OPENING,
      };
    } else {
      this.state.bars.get(index).short = {
        orderId: orderId,
        status: BarStatus.OPENING,
      };
    }
  }

  setBarOpened(index: number, side: TradeSide) {
    if (side == TradeSide.LONG) {
      this.state.bars.get(index).long.status = BarStatus.OPENED;
    } else {
      this.state.bars.get(index).short.status = BarStatus.OPENED;
    }
  }

  setBarClosed(index: number, side: TradeSide) {
    if (side == TradeSide.LONG) {
      this.state.bars.get(index).long = {
        orderId: null,
        status: BarStatus.CLOSED,
      };
    } else {
      this.state.bars.get(index).short = {
        orderId: null,
        status: BarStatus.CLOSED,
      };
    }
  }

  updatePositionByOrder(order: Order) {
    const size =
      order.side == TradeSide.LONG ? order.filledSize : -order.filledSize;
    this.state.position = this.pair.roundSize(this.state.position + size);
  }

  setStopLowerOrder(orderId: string) {
    this.state.stopOrders.lower = orderId;
  }

  setStopUpperOrder(orderId: string) {
    this.state.stopOrders.upper = orderId;
  }

  clearStopLowerOrder() {
    this.state.stopOrders.lower = null;
  }

  clearStopUpperOrder() {
    this.state.stopOrders.upper = null;
  }

  setTriggered() {
    this.state.isTriggered = true;
  }

  setTerminated() {
    this.state.isTerminated = true;
  }

  getBarAt(index: number): Readonly<BarState | null> {
    return this.state.bars.get(index);
  }

  getNearestBar(price: number): Readonly<BarState> {
    if (price <= this.config.lower) {
      return this.state.bars.get(0);
    } else if (price >= this.config.upper) {
      return this.state.bars.get(this.config.number);
    } else {
      return this.state.bars.get(
        Math.round((price - this.config.lower) / this.state.interval),
      );
    }
  }

  getBarAbove(bar: BarState): Readonly<BarState | null> {
    return bar.index < this.config.number
      ? this.state.bars.get(bar.index + 1)
      : null;
  }

  getBarBelow(bar: BarState): Readonly<BarState | null> {
    return bar.index > 0 ? this.state.bars.get(bar.index - 1) : null;
  }

  getLongBarToCloseAt(index: number): Readonly<BarState | null> {
    let ret: BarState = null;
    for (const bar of this.openedLongBars) {
      if (bar.index < index) {
        if (!ret || ret.index > bar.index) {
          ret = bar;
        }
      }
    }
    return ret;
  }

  /**
   * Get short bar to close at the given index
   *
   * @param index
   */
  getShortBarToCloseAt(index: number): Readonly<BarState | null> {
    let ret: BarState = null;
    for (const bar of this.openedShortBars) {
      if (bar.index > index) {
        if (!ret || ret.index < bar.index) {
          ret = bar;
        }
      }
    }
    return ret;
  }

  /**
   * Check if the bar is closed at the given index
   *
   * @param index
   */
  isClosedAt(index: number): boolean {
    const bar = this.state.bars.get(index);
    return (
      bar.long.status == BarStatus.CLOSED &&
      bar.short.status == BarStatus.CLOSED
    );
  }

  isOpenedLongAt(index: number): boolean {
    return this.state.bars.get(index).long.status == BarStatus.OPENED;
  }

  isOpenedShortAt(index: number): boolean {
    return this.state.bars.get(index).short.status == BarStatus.OPENED;
  }

  isClosedLongAt(index: number): boolean {
    return this.state.bars.get(index).long.status == BarStatus.CLOSED;
  }

  isClosedShortAt(index: number): boolean {
    return this.state.bars.get(index).short.status == BarStatus.CLOSED;
  }

  get openingLongBars(): ReadonlyArray<Readonly<BarState>> {
    return [...this.state.bars.values()]
      .filter((bar) => bar.long.status == BarStatus.OPENING)
      .reverse();
  }

  get openingShortBars(): ReadonlyArray<Readonly<BarState>> {
    return [...this.state.bars.values()].filter(
      (bar) => bar.short.status == BarStatus.OPENING,
    );
  }

  get openingOrderIds(): string[] {
    return this.openingLongBars
      .map((bar) => bar.long.orderId)
      .concat(this.openingShortBars.map((bar) => bar.short.orderId));
  }

  get openedLongBars(): ReadonlyArray<Readonly<BarState>> {
    return [...this.state.bars.values()].filter(
      (bar) => bar.long.status == BarStatus.OPENED,
    );
  }

  get openedShortBars(): ReadonlyArray<Readonly<BarState>> {
    return [...this.state.bars.values()].filter(
      (bar) => bar.short.status == BarStatus.OPENED,
    );
  }

  get position(): number {
    return this.state.position;
  }

  get pair(): Readonly<PerpetualPair> {
    return this.config.pair;
  }

  get size(): number {
    return this.config.size;
  }

  get maxTrial(): number {
    return this.config.maxTrial;
  }

  get triggerPriceRange(): ReadonlyArray<number> {
    return this.state.triggerRange;
  }

  get isTriggered(): boolean {
    return this.state.isTriggered;
  }

  get stopLowerPrice(): number {
    return this.config.stopLowerPrice;
  }

  get stopUpperPrice(): number {
    return this.config.stopUpperPrice;
  }

  get stopLowerOrderId(): string {
    return this.state.stopOrders.lower;
  }

  get stopUpperOrderId(): string {
    return this.state.stopOrders.upper;
  }

  get isTerminated(): boolean {
    return this.state.isTerminated;
  }
}

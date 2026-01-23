import { GridConfig } from '../config';
import { PerpetualPair } from '../../../../core/structures/pair';
import { Order } from '../../../../core/interfaces/market.interface';
import { TradeSide } from '../../../../core/constants';
import { GridState, LevelState, LevelStatus } from '../model/state';

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
    const levels = [];
    for (let i = 0; i < this.config.number; i++) {
      levels.push({
        index: i,
        price: this.config.pair.roundPrice(this.config.lower + i * interval),
        long: {
          orderId: null,
          status: LevelStatus.CLOSED,
        },
        short: {
          orderId: null,
          status: LevelStatus.CLOSED,
        },
      });
    }
    levels.push({
      index: this.config.number,
      price: this.config.upper,
      long: {
        orderId: null,
        status: LevelStatus.CLOSED,
      },
      short: {
        orderId: null,
        status: LevelStatus.CLOSED,
      },
    });
    this.state = {
      interval: interval,
      levels: levels,
      isTriggered: !this.config.triggerPrice,
      stopOrders: {
        lower: null,
        upper: null,
      },
      position: 0.0,
      isTerminated: false,
    };
  }

  setLevelOpening(index: number, orderId: string, side: TradeSide) {
    if (side == TradeSide.LONG) {
      this.state.levels[index].long = {
        orderId: orderId,
        status: LevelStatus.OPENING,
      };
    } else {
      this.state.levels[index].short = {
        orderId: orderId,
        status: LevelStatus.OPENING,
      };
    }
  }

  setLevelOpened(index: number, side: TradeSide) {
    if (side == TradeSide.LONG) {
      this.state.levels[index].long.status = LevelStatus.OPENED;
    } else {
      this.state.levels[index].short.status = LevelStatus.OPENED;
    }
  }

  setLevelClosed(index: number, side: TradeSide) {
    if (side == TradeSide.LONG) {
      this.state.levels[index].long = {
        orderId: null,
        status: LevelStatus.CLOSED,
      };
    } else {
      this.state.levels[index].short = {
        orderId: null,
        status: LevelStatus.CLOSED,
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

  getLevelAt(index: number): Readonly<LevelState | null> {
    return this.state.levels[index];
  }

  getNearestLevel(price: number): Readonly<LevelState> {
    if (price <= this.config.lower) {
      return this.state.levels[0];
    } else if (price >= this.config.upper) {
      return this.state.levels[this.config.number];
    } else {
      return this.state.levels[
        Math.round((price - this.config.lower) / this.state.interval)
      ];
    }
  }

  getLevelAbove(level: LevelState): Readonly<LevelState | null> {
    return level.index < this.config.number
      ? this.state.levels[level.index + 1]
      : null;
  }

  getLevelBelow(level: LevelState): Readonly<LevelState | null> {
    return level.index > 0 ? this.state.levels[level.index - 1] : null;
  }

  getLongLevelToCloseAt(index: number): Readonly<LevelState | null> {
    let ret: LevelState = null;
    for (const level of this.openedLongLevels) {
      if (level.index < index) {
        if (!ret || ret.index > level.index) {
          ret = level;
        }
      }
    }
    return ret;
  }

  /**
   * Get short level to close at the given index
   *
   * @param index
   */
  getShortLevelToCloseAt(index: number): Readonly<LevelState | null> {
    let ret: LevelState = null;
    for (const level of this.openedShortLevels) {
      if (level.index > index) {
        if (!ret || ret.index < level.index) {
          ret = level;
        }
      }
    }
    return ret;
  }

  /**
   * Check if the level is closed at the given index
   *
   * @param index
   */
  isClosedAt(index: number): boolean {
    const level = this.state.levels[index];
    return (
      level.long.status == LevelStatus.CLOSED &&
      level.short.status == LevelStatus.CLOSED
    );
  }

  isOpenedLongAt(index: number): boolean {
    return this.state.levels[index].long.status == LevelStatus.OPENED;
  }

  isOpenedShortAt(index: number): boolean {
    return this.state.levels[index].short.status == LevelStatus.OPENED;
  }

  isClosedLongAt(index: number): boolean {
    return this.state.levels[index].long.status == LevelStatus.CLOSED;
  }

  isClosedShortAt(index: number): boolean {
    return this.state.levels[index].short.status == LevelStatus.CLOSED;
  }

  get openingLongLevels(): ReadonlyArray<Readonly<LevelState>> {
    return [...this.state.levels.values()]
      .filter((level) => level.long.status == LevelStatus.OPENING)
      .reverse();
  }

  get openingShortLevels(): ReadonlyArray<Readonly<LevelState>> {
    return [...this.state.levels.values()].filter(
      (level) => level.short.status == LevelStatus.OPENING,
    );
  }

  get openingOrderIds(): string[] {
    return this.openingLongLevels
      .map((level) => level.long.orderId)
      .concat(this.openingShortLevels.map((level) => level.short.orderId));
  }

  get openedLongLevels(): ReadonlyArray<Readonly<LevelState>> {
    return [...this.state.levels.values()].filter(
      (level) => level.long.status == LevelStatus.OPENED,
    );
  }

  get openedShortLevels(): ReadonlyArray<Readonly<LevelState>> {
    return [...this.state.levels.values()].filter(
      (level) => level.short.status == LevelStatus.OPENED,
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

  get interval(): number {
    return this.state.interval;
  }

  get triggerPrice() {
    return this.config.triggerPrice;
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

  get gridDescription(): string {
    return `[${this.config.lower}, ${this.config.upper}], ${this.config.number} levels`;
  }
}

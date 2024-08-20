import { BarState, GridConfig, GridState } from './types';
import { PerpetualPair } from '../../../core/structures/pair';

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
        orderId: null,
      });
    }
    bars.set(this.config.number, {
      index: this.config.number,
      price: this.config.upper,
      orderId: null,
    });
    this.state = {
      interval: interval,
      bars: bars,
      currentBars: {
        long: null,
        short: null,
      },
      isTriggered: !this.config.triggerPrice,
      triggerRange: !!this.config.triggerPrice
        ? [
            this.config.triggerPrice - interval,
            this.config.triggerPrice + interval,
          ]
        : [this.config.lower - interval, this.config.upper + interval],
    };
  }

  setCurrentBars(longBar: BarState, shortBar: BarState) {
    // Update current bars with the given bars
    this.state.currentBars = {
      long: longBar,
      short: shortBar,
    };
  }

  setOrderId(bar: NonNullable<BarState>, orderId: string) {
    bar.orderId = orderId;
  }

  setTriggered() {
    this.state.isTriggered = true;
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

  get longBar(): Readonly<BarState | null> {
    return this.state.currentBars.long;
  }

  get shortBar(): Readonly<BarState | null> {
    return this.state.currentBars.short;
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
}

import { Logger } from '@nestjs/common';
import { PerpBroker } from '../../../core/interfaces/broker.interface';
import { StateManager } from './state_manager';
import { BarState } from './types';
import { OrderStatus, TradeSide } from '../../../core/constants';

/**
 * Grid Operator
 *
 * @author Yepeng Ding
 */
export class Operator {
  private readonly logger = new Logger(Operator.name);

  private readonly broker: PerpBroker;
  private readonly state: StateManager;

  constructor(broker: PerpBroker, state: StateManager) {
    this.broker = broker;
    this.state = state;
  }

  async openBarsNearMarketPrice() {
    const marketPrice = await this.broker.getMarketPrice(this.state.pair);
    const bar = this.state.getNearestBar(marketPrice);
    const barBelow = this.state.getBarBelow(bar);
    const barAbove = this.state.getBarAbove(bar);

    if (
      !!barBelow &&
      (this.state.isClosedAt(barBelow.index) ||
        (this.state.isOpenedShortAt(bar.index) &&
          this.state.isClosedLongAt(barBelow.index)))
    ) {
      await this.placeLongOrderAt(barBelow);
    }
    if (
      !!barAbove &&
      (this.state.isClosedAt(barAbove.index) ||
        (this.state.isOpenedLongAt(bar.index) &&
          this.state.isClosedShortAt(barAbove.index)))
    ) {
      await this.placeShortOrderAt(barAbove);
    }
  }

  async placeLongOrderAt(bar: BarState): Promise<BarState> {
    let order = null;
    for (let i = 0; i < this.state.maxTrial; i++) {
      order = await this.broker
        .placeGTXLong(this.state.pair, this.state.size, bar.price)
        .then((order) => {
          if (!!order) {
            this.state.setBarOpening(bar.index, order.id, TradeSide.LONG);
          } else {
            this.logger.error(`Failed to place long order at bar ${bar.index}`);
          }
          return order;
        });
      if (
        !!order &&
        (await this.broker.getOrder(order.id, this.state.pair)).status !=
          OrderStatus.CANCELLED
      ) {
        break;
      }
    }
    return !!order ? this.state.getBarAt(bar.index) : bar;
  }

  async placeShortOrderAt(bar: BarState): Promise<BarState> {
    let order = null;
    for (let i = 0; i < this.state.maxTrial; i++) {
      order = await this.broker
        .placeGTXShort(this.state.pair, this.state.size, bar.price)
        .then((order) => {
          if (!!order) {
            this.state.setBarOpening(bar.index, order.id, TradeSide.SHORT);
          } else {
            this.logger.error(
              `Failed to place short order at bar ${bar.index}`,
            );
          }
          return order;
        });
      if (
        !!order &&
        (await this.broker.getOrder(order.id, this.state.pair)).status !=
          OrderStatus.CANCELLED
      ) {
        break;
      }
    }
    return !!order ? this.state.getBarAt(bar.index) : bar;
  }

  /**
   * Update the stop lower (short) order if needed
   *
   */
  async updateStopLowerOrder(): Promise<boolean> {
    // If no stop lower price or the current position is short (<=0), then no update
    if (!this.state.stopLowerPrice || this.state.position <= 0) {
      return true;
    }
    if (!!this.state.stopLowerOrderId) {
      const order = await this.broker.getOrder(
        this.state.stopLowerOrderId,
        this.state.pair,
      );
      if (
        order.status == OrderStatus.OPEN &&
        order.size == this.state.position
      ) {
        // If the open order has the same size as the position, then no update
        return true;
      } else if (order.status == OrderStatus.OPEN) {
        await this.broker.cancelOrder(order.id, this.state.pair);
      }
    }
    // Place new stop short order
    let order = null;
    for (let i = 0; i < this.state.maxTrial; i++) {
      order = await this.broker
        .placeStopMarketShort(
          this.state.pair,
          this.state.position,
          this.state.stopLowerPrice,
        )
        .then((order) => {
          if (!!order) {
            this.state.setStopLowerOrder(order.id);
          } else {
            this.logger.error(
              `Failed to place stop lower order (size: ${this.state.position})`,
            );
          }
          return order;
        });
      if (
        !!order &&
        (await this.broker.getOrder(order.id, this.state.pair)).status !=
          OrderStatus.CANCELLED
      ) {
        break;
      }
    }
    return !!order;
  }

  /**
   * Update the stop upper (long) order if needed
   *
   */
  async updateStopUpperOrder(): Promise<boolean> {
    // If no stop upper price or the current position is long (>=0), then no update
    if (!this.state.stopUpperPrice || this.state.position >= 0) {
      return true;
    }
    if (!!this.state.stopUpperOrderId) {
      const order = await this.broker.getOrder(
        this.state.stopUpperOrderId,
        this.state.pair,
      );
      if (
        order.status == OrderStatus.OPEN &&
        order.size == -this.state.position
      ) {
        // If the open order has the same size as the position, then no update
        return true;
      } else if (order.status == OrderStatus.OPEN) {
        await this.broker.cancelOrder(order.id, this.state.pair);
      }
    }
    // Place new stop short order
    let order = null;
    for (let i = 0; i < this.state.maxTrial; i++) {
      order = await this.broker
        .placeStopMarketLong(
          this.state.pair,
          -this.state.position,
          this.state.stopUpperPrice,
        )
        .then((order) => {
          if (!!order) {
            this.state.setStopUpperOrder(order.id);
          } else {
            this.logger.error(
              `Failed to place stop upper order (size: ${-this.state.position})`,
            );
          }
          return order;
        });
      if (
        !!order &&
        (await this.broker.getOrder(order.id, this.state.pair)).status !=
          OrderStatus.CANCELLED
      ) {
        break;
      }
    }
    return !!order;
  }

  async cancelAllBarOrders() {
    await this.broker.cancelOrders(this.state.openingOrderIds, this.state.pair);
  }

  async cancelStopOrders() {
    const ids = [];
    if (!!this.state.stopUpperOrderId) {
      ids.push(this.state.stopUpperOrderId);
    }
    if (!!this.state.stopLowerOrderId) {
      ids.push(this.state.stopLowerOrderId);
    }
    await this.broker.cancelOrders(ids, this.state.pair);
  }

  async closePosition() {
    if (this.state.position > 0) {
      // Close by short
      await this.broker.placeMarketShort(this.state.pair, this.state.position);
    } else if (this.state.position < 0) {
      // Close by long
      await this.broker.placeMarketLong(this.state.pair, -this.state.position);
    }
  }
}

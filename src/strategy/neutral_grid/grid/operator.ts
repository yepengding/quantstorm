import { Logger } from '@nestjs/common';
import { Broker } from '../../../core/interfaces/broker.interface';
import { StateManager } from './state_manager';
import { BarState } from './types';
import { OrderStatus } from '../../../core/constants';

/**
 * Grid Operator
 *
 * @author Yepeng Ding
 */
export class Operator {
  private readonly logger = new Logger(Operator.name);

  private readonly broker: Broker;
  private readonly state: StateManager;

  constructor(broker: Broker, state: StateManager) {
    this.broker = broker;
    this.state = state;
  }

  async updateCurrentBars() {
    const marketPrice = await this.broker.getMarketPrice(this.state.pair);
    const bar = this.state.getNearestBar(marketPrice);
    const barLong = this.state.getBarBelow(bar);
    const barShort = this.state.getBarAbove(bar);
    if (!!barLong) {
      await this.placeLongOrderAt(barLong);
    }
    if (!!barShort) {
      await this.placeShortOrderAt(barShort);
    }
    this.state.setCurrentBars(barLong, barShort);
  }

  async placeLongOrderAt(bar: BarState): Promise<BarState> {
    if (await this.orderExistsAt(bar)) {
      return bar;
    }
    let order = null;
    for (let i = 0; i < this.state.maxTrial; i++) {
      order = await this.broker
        .placeGTXLong(this.state.pair, this.state.size, bar.price)
        .then((order) => {
          if (!!order) {
            this.state.setOrderId(bar, order.id);
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
    if (await this.orderExistsAt(bar)) {
      return bar;
    }
    let order = null;
    for (let i = 0; i < this.state.maxTrial; i++) {
      order = await this.broker
        .placeGTXShort(this.state.pair, this.state.size, bar.price)
        .then((order) => {
          if (!!order) {
            this.state.setOrderId(bar, order.id);
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

  private async orderExistsAt(bar: NonNullable<BarState>): Promise<boolean> {
    if (!!bar.orderId) {
      return await this.broker
        .getOrder(bar.orderId, this.state.pair)
        .then((order) => {
          if (!!order) {
            return order.status == OrderStatus.OPEN;
          } else {
            this.logger.error(
              `Cannot find order ${bar.orderId} at index ${bar.index}`,
            );
            return false;
          }
        });
    } else {
      return false;
    }
  }
}

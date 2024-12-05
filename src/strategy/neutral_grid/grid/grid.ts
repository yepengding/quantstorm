import { Operator } from './operator';
import { StateManager } from './state_manager';
import { Broker } from '../../../core/interfaces/broker.interface';
import { Logger } from '@nestjs/common';
import { BarState, GridConfig } from './types';
import { OrderStatus, TradeSide } from '../../../core/constants';
import { Order } from '../../../core/interfaces/market.interface';

/**
 * Grid Core Logic
 *
 * @author Yepeng Ding
 */
export class Grid {
  private readonly config: GridConfig;

  private readonly state: StateManager;
  private readonly operator: Operator;
  private readonly broker: Broker;

  private readonly logger: Logger;

  constructor(config: GridConfig, broker: Broker, logger: Logger) {
    this.config = config;
    this.state = new StateManager(config);
    this.operator = new Operator(broker, this.state);
    this.broker = broker;
    this.logger = logger;
  }

  public async init() {
    if (!!this.config.triggerPrice) {
      if (!this.state.isTriggered) {
        const marketPrice = await this.broker.getMarketPrice(this.config.pair);
        if (
          marketPrice > this.state.triggerPriceRange[0] &&
          marketPrice < this.state.triggerPriceRange[1]
        ) {
          await this.operator.openBarsNearMarketPrice();
          this.state.setTriggered();
          this.logger.log(
            `Initialized grid [${this.config.lower}, ${this.config.upper}]`,
          );
        }
      }
    } else {
      await this.operator.openBarsNearMarketPrice();
      this.state.setTriggered();
      this.logger.log(
        `Initialized grid [${this.config.lower}, ${this.config.upper}]`,
      );
    }
  }

  public async next() {
    if (this.state.isTerminated) {
      this.logger.log('Terminated');
      return;
    }
    if (!this.state.isTriggered) {
      await this.init();
      return;
    }
    await this.checkStopOrders();
    await this.checkOpeningLongBars();
    await this.checkOpeningShortBars();
    await this.operator.openBarsNearMarketPrice();
  }

  private async checkOpeningLongBars() {
    const openingBars = this.state.openingLongBars;
    for (const bar of openingBars) {
      const order = await this.broker.getOrder(
        bar.long.orderId,
        this.config.pair,
      );
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          this.state.setBarOpened(bar.index, TradeSide.LONG);
          const barToClose: BarState = this.state.getShortBarToCloseAt(
            bar.index,
          );
          if (!!barToClose) {
            this.state.setBarClosed(barToClose.index, TradeSide.SHORT);
            this.state.setBarClosed(bar.index, TradeSide.LONG);
          }
          await this.operator.updateStopUpperOrder();
          await this.operator.updateStopLowerOrder();
          this.logger.verbose(`Long order at ${bar.index} is filled.`);
        }
      } else {
        this.logger.error(
          `Cannot find the long order (${bar.long.orderId}) at (${bar.index})`,
        );
      }
    }
  }

  private async checkOpeningShortBars() {
    const openingBars = this.state.openingShortBars;
    for (const bar of openingBars) {
      const order = await this.broker.getOrder(
        bar.short.orderId,
        this.config.pair,
      );
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          this.state.setBarOpened(bar.index, TradeSide.SHORT);
          const barToClose: BarState = this.state.getLongBarToCloseAt(
            bar.index,
          );
          if (!!barToClose) {
            this.state.setBarClosed(barToClose.index, TradeSide.LONG);
            this.state.setBarClosed(bar.index, TradeSide.SHORT);
          }
          await this.operator.updateStopUpperOrder();
          await this.operator.updateStopLowerOrder();
          this.logger.verbose(`Short order at ${bar.index} is filled.`);
        }
      } else {
        this.logger.error(
          `Cannot find the short order (${bar.short.orderId}) at (${bar.index})`,
        );
      }
    }
  }

  private async checkStopOrders() {
    let order: Order;
    if (!!this.state.stopLowerOrderId) {
      order = await this.broker.getOrder(
        this.state.stopLowerOrderId,
        this.config.pair,
      );
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          this.state.clearStopLowerOrder();
          // await this.terminate();
          this.logger.verbose(
            `Stop lower order (size: ${order.size}) is filled`,
          );
        }
      } else {
        this.logger.error(
          `Stop lower order (${this.state.stopLowerOrderId}) is missing.`,
        );
      }
    }
    if (!!this.state.stopUpperOrderId) {
      order = await this.broker.getOrder(
        this.state.stopUpperOrderId,
        this.config.pair,
      );
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          this.state.clearStopUpperOrder();
          // await this.terminate();
          this.logger.verbose(
            `Stop upper order (${order.id}) (size: ${order.size}) is filled`,
          );
        }
      } else {
        this.logger.error(
          `Stop upper order (${this.state.stopUpperOrderId}) is missing.`,
        );
      }
    }
  }

  /**
   * Terminate grid
   *
   */
  public async terminate() {
    await this.operator.cancelAllBarOrders();
    await this.operator.cancelStopOrders();
    await this.operator.closePosition();
    this.state.setTerminated();
  }

  static create(config: GridConfig, broker: Broker, logger: Logger): Grid {
    return new Grid(config, broker, logger);
  }
}

import { Operator } from './module/operator';
import { StateManager } from './module/state_manager';
import { PerpBroker } from '../../../core/interfaces/broker.interface';
import { Logger } from '@nestjs/common';
import { getBroker, GridConfig, GridConfigArg } from './config';
import { OrderStatus, TradeSide } from '../../../core/constants';
import { Order } from '../../../core/interfaces/market.interface';
import { LevelState } from './model/state';

/**
 * Grid Core Logic
 *
 * @author Yepeng Ding
 */
export class Grid {
  private readonly config: GridConfig;

  private readonly state: StateManager;
  private readonly operator: Operator;
  private broker: PerpBroker;

  private readonly logger: Logger;

  constructor(config: GridConfig, broker: PerpBroker, logger: Logger) {
    this.config = config;
    this.state = new StateManager(config);
    this.operator = new Operator(broker, this.state);
    this.broker = broker;
    this.logger = logger;
  }

  public async init(): Promise<void> {
    await this.operator.triggerGrid();
  }

  public async next(): Promise<void> {
    if (this.state.isTerminated) {
      this.logger.log('Terminated');
      return;
    }
    if (!this.state.isTriggered) {
      await this.operator.triggerGrid();
      return;
    }
    await this.checkStopOrders();
    await this.checkOpeningLongLevels();
    await this.checkOpeningShortLevels();
    await this.operator.openLevelsNearMarketPrice();
  }

  private async checkOpeningLongLevels() {
    const openingLevels = this.state.openingLongLevels;
    for (const level of openingLevels) {
      const order = await this.broker.getOrder(
        level.long.orderId,
        this.config.pair,
      );
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          this.state.setLevelOpened(level.index, TradeSide.LONG);
          const levelToClose: LevelState = this.state.getShortLevelToCloseAt(
            level.index,
          );
          if (!!levelToClose) {
            this.state.setLevelClosed(levelToClose.index, TradeSide.SHORT);
            this.state.setLevelClosed(level.index, TradeSide.LONG);
          }
          await this.operator.updateStopUpperOrder();
          await this.operator.updateStopLowerOrder();
          this.logger.verbose(`Long order at ${level.index} is filled.`);
        }
      } else {
        this.logger.error(
          `Cannot find the long order (${level.long.orderId}) at (${level.index})`,
        );
      }
    }
  }

  private async checkOpeningShortLevels() {
    const openingLevels = this.state.openingShortLevels;
    for (const level of openingLevels) {
      const order = await this.broker.getOrder(
        level.short.orderId,
        this.config.pair,
      );
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          this.state.setLevelOpened(level.index, TradeSide.SHORT);
          const levelToClose: LevelState = this.state.getLongLevelToCloseAt(
            level.index,
          );
          if (!!levelToClose) {
            this.state.setLevelClosed(levelToClose.index, TradeSide.LONG);
            this.state.setLevelClosed(level.index, TradeSide.SHORT);
          }
          await this.operator.updateStopUpperOrder();
          await this.operator.updateStopLowerOrder();
          this.logger.verbose(`Short order at ${level.index} is filled.`);
        }
      } else {
        this.logger.error(
          `Cannot find the short order (${level.short.orderId}) at (${level.index})`,
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
    await this.operator.cancelAllLevelOrders();
    await this.operator.cancelStopOrders();
    await this.operator.closePosition();
    this.state.setTerminated();
  }

  static create(config: GridConfig, broker: PerpBroker, logger: Logger): Grid {
    return new Grid(config, broker, logger);
  }
}

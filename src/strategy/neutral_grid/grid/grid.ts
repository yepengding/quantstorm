import { Operator } from './operator';
import { StateManager } from './state_manager';
import { Broker } from '../../../core/interfaces/broker.interface';
import { Logger } from '@nestjs/common';
import { BarState, GridConfig } from './types';
import { OrderStatus } from '../../../core/constants';

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
          await this.operator.updateCurrentBars();
          this.state.setTriggered();
          this.logger.log(
            `Start grid between bar ${!!this.state.longBar ? this.state.longBar.index : null} and ${!!this.state.shortBar ? this.state.shortBar.index : null}`,
          );
        }
      }
    } else {
      await this.operator.updateCurrentBars();
      this.state.setTriggered();
      this.logger.log(
        `Start grid between bar ${!!this.state.longBar ? this.state.longBar.index : null} and ${!!this.state.shortBar ? this.state.shortBar.index : null}`,
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
    await this.checkCurrenBars();
  }

  /**
   * Terminate grid
   *
   */
  public async terminate() {
    await this.operator.cancelAllBarOrders();
    await this.operator.cancelStopOrders();
    await this.operator.closePosition();
    this.state.setCurrentBars(null, null);
    this.state.setTerminated();
  }

  private async checkCurrenBars() {
    await this.checkLong(this.state.longBar);
    await this.checkShort(this.state.shortBar);
  }

  private async checkLong(bar: BarState) {
    if (!!bar) {
      const order = await this.broker.getOrder(bar.orderId, this.config.pair);
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          await this.operator.updateCurrentBars();
          this.logger.verbose(`Long order at ${bar.index} is filled.`);
        }
      } else {
        this.logger.error(
          `Cannot find the long order (${bar.orderId}) at (${bar.index})`,
        );
      }
    }
  }

  private async checkShort(bar: BarState) {
    if (!!bar) {
      const order = await this.broker.getOrder(bar.orderId, this.config.pair);
      if (!!order) {
        if (order.status == OrderStatus.FILLED) {
          this.state.updatePositionByOrder(order);
          await this.operator.updateCurrentBars();
          this.logger.verbose(`Short order at ${bar.index} is filled.`);
        }
      } else {
        this.logger.error(
          `Cannot find the short order (${bar.orderId}) at (${bar.index})`,
        );
      }
    }
  }

  static create(config: GridConfig, broker: Broker, logger: Logger): Grid {
    return new Grid(config, broker, logger);
  }
}

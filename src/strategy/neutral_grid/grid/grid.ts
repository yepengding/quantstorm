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
    await this.operator.updateCurrentBars();
    this.logger.log(
      `Start grid between bar ${!!this.state.longBar ? this.state.longBar.index : null} and ${!!this.state.shortBar ? this.state.shortBar.index : null}`,
    );
  }

  public async next() {
    await this.checkCurrenBars();
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
          this.logger.verbose(`Long order at ${bar.index} is filled.`);
          await this.operator.updateCurrentBars();
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
          this.logger.verbose(`Short order at ${bar.index} is filled.`);
          await this.operator.updateCurrentBars();
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

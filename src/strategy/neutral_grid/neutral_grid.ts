import { StrategyAbstract } from '../strategy.abstract';
import { Logger } from '@nestjs/common';
import { PerpetualPair } from '../../core/structures/pair';
import { GridConfig, GridConfigArg } from './grid/types';
import { Grid } from './grid/grid';

/**
 * Neutral Grid Strategy
 *
 * @author Yepeng Ding
 */
export class NeutralGrid extends StrategyAbstract {
  public name: string = NeutralGrid.name;
  private readonly logger = new Logger(NeutralGrid.name);

  private config: GridConfig;

  private grid: Grid;

  async init(args: string): Promise<void> {
    const config = JSON.parse(args) as GridConfigArg;
    this.config = {
      pair: new PerpetualPair(config.base, config.quote),
      lower: config.lower,
      upper: config.upper,
      number: config.number,
      size: config.size,
      maxTrial: !!config.maxTrial ? config.maxTrial : 3,
    };
    this.logger.log(`Config: ${JSON.stringify(this.config)}`);

    this.grid = Grid.create(this.config, this.broker, this.logger);
    await this.grid.init();
  }

  async next(): Promise<void> {
    await this.grid.next();
  }
}

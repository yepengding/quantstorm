import { PerpetualPair } from '../../../core/structures/pair';
import { Logger } from '@nestjs/common';
import { PerpBroker } from '../../../core/interfaces/broker.interface';
import { BinanceConfig } from '../../../broker/binance/binance.interface';
import { BinancePerpBrokerService } from '../../../broker/binance/perp/binance.perp.broker.service';

export type GridConfigArg = {
  exchange?: string;
  binance?: BinanceConfig;
  base: string;
  quote: string;
  lower: number;
  upper: number;
  // Number of grids
  number: number;
  // Size per level
  size: number;
  // Max number of trials to place level order
  maxTrial?: number;
  // Start grid if the market price is near triggerPrice
  triggerPrice?: number;
  // Terminate grid and close grid position if the market price reaches stopUpperPrice or stopLowerPrice
  stopLowerPrice?: number;
  stopUpperPrice?: number;
};

export type GridConfig = {
  pair: PerpetualPair;
  lower: number;
  upper: number;
  // Number of grids
  number: number;
  // Size per level
  size: number;
  // Max number of trials to place level order
  maxTrial: number;
  // Start grid if the market price is near triggerPrice
  triggerPrice?: number;
  // Terminate grid and close grid position if the market price reaches stopUpperPrice or stopLowerPrice
  stopUpperPrice?: number;
  stopLowerPrice?: number;
};

export function getBroker(
  config: GridConfigArg,
  logger: Logger,
): PerpBroker | null {
  if (!!config.exchange) {
    switch (config.exchange) {
      case 'binance': {
        return new BinancePerpBrokerService(config.binance, logger);
      }
    }
  } else {
    return null;
  }
}

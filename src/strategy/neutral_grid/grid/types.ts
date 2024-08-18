import { PerpetualPair } from '../../../core/structures/pair';

export type GridConfigArg = {
  base: string;
  quote: string;
  lower: number;
  upper: number;
  // Number of grids
  number: number;
  // Size per bar
  size: number;
  // Max number of trials to place bar order
  maxTrial?: number;
};

export type GridConfig = {
  pair: PerpetualPair;
  lower: number;
  upper: number;
  // Number of grids
  number: number;
  // Size per bar
  size: number;
  // Max number of trials to place bar order
  maxTrial: number;
};

export type GridState = {
  interval: number;
  bars: Map<number, BarState>;
  currentBars: {
    long: BarState;
    short: BarState;
  };
};

/**
 * Bar Type.
 * The minimal element of a grid.
 */
export type BarState = {
  index: number;
  price: number;
  orderId: string;
};

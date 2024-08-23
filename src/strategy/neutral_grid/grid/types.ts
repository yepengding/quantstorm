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
  // Size per bar
  size: number;
  // Max number of trials to place bar order
  maxTrial: number;
  // Start grid if the market price is near triggerPrice
  triggerPrice?: number;
  // Terminate grid and close grid position if the market price reaches stopUpperPrice or stopLowerPrice
  stopUpperPrice?: number;
  stopLowerPrice?: number;
};

export type GridState = {
  interval: number;
  bars: Map<number, BarState>;
  currentBars: {
    long: BarState;
    short: BarState;
  };
  isTriggered: boolean;
  triggerRange: [number, number];
  stopOrders: {
    lower: string;
    upper: string;
  };
  // Positive => Long | Negative => Short
  position: number;
  isTerminated: boolean;
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

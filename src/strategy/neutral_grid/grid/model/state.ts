/**
 * Grid state
 */
export type GridState = {
  interval: number;
  levels: LevelState[];
  isTriggered: boolean;
  stopOrders: {
    lower: string;
    upper: string;
  };
  // Positive => Long | Negative => Short
  position: number;
  isTerminated: boolean;
};

/**
 * Level state.
 * The minimal element of a grid.
 */
export type LevelState = {
  index: number;
  price: number;
  long: {
    orderId: string | null;
    status: LevelStatus;
  };
  short: {
    orderId: string | null;
    status: LevelStatus;
  };
};

export enum LevelStatus {
  // Level contains an open order
  OPENING,
  // Level order is filled and cannot close any opened level
  OPENED,
  // Level order is filled and closes another level
  CLOSED,
}

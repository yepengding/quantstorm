export type ChartOrders = {
  long: ChartOrder[];
  short: ChartOrder[];
};

export type ChartOrder = {
  // Timestamp
  x: number;
  // Price
  y: number;
};

export type ChartBalance = {
  // Timestamp
  x: number;
  // Balance
  y: number;
};

export type ChartBalances = ChartBalance[];

export type ChartKLine = {
  // Timestamp
  x: number;
  o: number;
  h: number;
  l: number;
  c: number;
};

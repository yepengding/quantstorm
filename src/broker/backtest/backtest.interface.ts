export interface FeederConfig {
  dataCacheSize: number;
  dataPath: string;
}

export interface BacktestConfig {
  tick: number;
  commission: {
    maker: number;
    taker: number;
  };
  feeder: FeederConfig;
}

import * as process from 'node:process';
import { BinanceConfig } from '../binance/broker/binance.broker.interface';

export default () => ({
  backtest: {
    dataPath: process.env.BACKTEST_DATA_PATH || '',
    dataCacheSize: 32768,
    startTimestamp: parseInt(process.env.BACKTEST_START_TIMESTAMP, 10) || 0,
    endTimestamp: parseInt(process.env.BACKTEST_END_TIMESTAMP, 10) || 0,
    executionInterval: process.env.BACKTEST_EXECUTION_INTERVAL || '15m',
  },
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_SECRET || '',
  } as BinanceConfig,
});

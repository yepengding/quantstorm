import * as process from 'node:process';
import { BinanceConfig } from '../broker/binance/binance.interface';
import { BitgetConfig } from '../broker/bitget/bitget.interface';
import { BacktestConfig } from '../broker/backtest/backtest.broker.interface';

export default () => ({
  backtest: {
    tick: parseInt(process.env.BACKTEST_TICK) || 1,
    commission: {
      maker: parseInt(process.env.BACKTEST_COMMISSION_MAKER) || 0,
      taker: parseInt(process.env.BACKTEST_COMMISSION_TAKER) || 0,
    },
    feeder: {
      dataPath: process.env.BACKTEST_DATA_PATH || '',
      dataCacheSize: parseInt(process.env.BACKTEST_DATA_CACHE_SIZE) || 32768,
    },
  } as BacktestConfig,
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_SECRET || '',
  } as BinanceConfig,
  bitget: {
    apiKey: process.env.BITGET_API_KEY || '',
    secret: process.env.BITGET_SECRET || '',
    password: process.env.BITGET_PASSWORD || '',
  } as BitgetConfig,
  db: {
    type: process.env.DB_TYPE || 'sqlite',
    name: process.env.DB_NAME || 'quantstorm',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    path: process.env.DB_PATH || '/quantstorm_db',
  },
  log: {
    path: process.env.LOG_PATH || '/quantstorm_log',
  },
});

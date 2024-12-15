import * as process from 'node:process';
import { BinanceAPIConfig } from '../broker/binance/binance.interface';
import { BitgetApiConfig } from '../broker/bitget/bitget.interface';

export default () => ({
  backtest: {
    dataPath: process.env.BACKTEST_DATA_PATH || '',
    tick: parseInt(process.env.BACKTEST_TICK) || 1,
    commission: {
      taker: parseInt(process.env.BACKTEST_COMMISSION_TAKER) || 0,
      maker: parseInt(process.env.BACKTEST_COMMISSION_MAKER) || 0,
    },
    dataCacheSize: parseInt(process.env.BACKTEST_DATA_CACHE_SIZE) || 32768,
  },
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_SECRET || '',
  } as BinanceAPIConfig,
  bitget: {
    apiKey: process.env.BITGET_API_KEY || '',
    secret: process.env.BITGET_SECRET || '',
    password: process.env.BITGET_PASSWORD || '',
  } as BitgetApiConfig,
  db: {
    path: process.env.DB_PATH || '/quantstorm_db',
  },
});

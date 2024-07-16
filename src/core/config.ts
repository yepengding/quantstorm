import * as process from 'node:process';

export default () => ({
  strategy: process.env.STRATEGY || 'demo',
  backtest: {
    dataPath: process.env.BACKTEST_DATA_PATH || '',
    startTimestamp: parseInt(process.env.BACKTEST_START_TIMESTAMP, 10) || 0,
    interval: process.env.BACKTEST_INTERVAL || '15m',
  },
});

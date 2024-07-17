import * as process from 'node:process';

export default () => ({
  strategy: process.env.STRATEGY || 'demo',
  backtest: {
    dataPath: process.env.BACKTEST_DATA_PATH || '',
    startTimestamp: parseInt(process.env.BACKTEST_START_TIMESTAMP, 10) || 0,
    endTimestamp: parseInt(process.env.BACKTEST_END_TIMESTAMP, 10) || 0,
    executionInterval: process.env.BACKTEST_EXECUTION_INTERVAL || '15m',
  },
});

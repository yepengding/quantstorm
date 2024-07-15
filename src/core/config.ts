export default () => ({
  strategy: process.env.STRATEGY || 'demo',
  backtest: {
    dataPath: process.env.BACKTEST_DATA_PATH || '',
  },
});

import { PerpetualPair } from './pair';

describe('Pair', () => {
  it('should create a linear perpetual pair', () => {
    const pair = new PerpetualPair('BTC', 'USDT');
    expect(pair.toFuturesSymbol()).toEqual('BTC/USDT:USDT');
  });
  it('should create an inverse perpetual pair', () => {
    const pair = new PerpetualPair('BTC', 'USDT', true);
    expect(pair.toFuturesSymbol()).toEqual('BTC/USDT:BTC');
  });
  it('should create a linear perpetual pair from a symbol', () => {
    const pair = PerpetualPair.fromSymbol('BTC/USDT:USDT');
    expect(pair.toFuturesSymbol()).toEqual('BTC/USDT:USDT');
  });
});

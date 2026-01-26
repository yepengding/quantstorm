import { OptionPair, PerpetualPair } from './pair';

describe('Pair', () => {
  it('should create a linear perpetual pair', () => {
    const pair = new PerpetualPair('BTC', 'USDT');
    expect(pair.toPerpetualSymbol()).toEqual('BTC/USDT:USDT');
  });
  it('should create an inverse perpetual pair', () => {
    const pair = new PerpetualPair('BTC', 'USDT', true);
    expect(pair.toPerpetualSymbol()).toEqual('BTC/USDT:BTC');
  });
  it('should create a linear perpetual pair from a symbol', () => {
    const pair = PerpetualPair.fromSymbol('BTC/USDT:USDT');
    expect(pair.toPerpetualSymbol()).toEqual('BTC/USDT:USDT');
  });
  it('should create an option pair from a symbol', () => {
    const pair = OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C');
    expect(pair.toOptionSymbol()).toEqual('BTC/USDT:USDT-260327-100000-C');
  });
});

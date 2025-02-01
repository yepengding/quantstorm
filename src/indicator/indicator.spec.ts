import { Indicator } from './indicator';

describe('Indicator', () => {
  it('should compute Simple Moving Average', () => {
    console.log(Indicator.SMA([5, 6, 7, 8, 9], 3));
  });
  it('should compute Exponential Moving Average', () => {
    console.log(Indicator.EMA([5, 6, 7, 8, 9], 3));
  });
  it('should compute Bollinger Bands', () => {
    console.log(Indicator.BollingerBands([3000, 3010, 3020], 3, 2));
  });
  it('should compute MACD', () => {
    console.log(
      Indicator.MACD(
        [3000, 3010, 3020, 3030, 3040, 3000, 2950, 2960, 2970, 2980, 3050],
        6,
        8,
        3,
      ),
    );
  });
});

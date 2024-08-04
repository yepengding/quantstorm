import { Indicator } from './indicator';

describe('Indicator', () => {
  it('should compute Simple Moving Average', () => {
    console.log(Indicator.SMA([5, 6, 7, 8, 9], 3));
  });
  it('should compute Bollinger Bands', () => {
    console.log(Indicator.BollingerBands([3000, 3010, 3020], 3, 2));
  });
});

import { Indicator } from './indicator';

describe('Indicator', () => {
  it('should compute Bollinger Bands', () => {
    console.log(Indicator.BollingerBands([3000, 3010, 3020], 3, 2));
  });
});

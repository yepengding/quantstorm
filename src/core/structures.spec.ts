import { Series } from './structures';

describe('Structures', () => {
  describe('Series', () => {
    it('should add a series', () => {
      const series = new Series([1, 2]);
      expect(series.add([3, 4])).toEqual([4, 6]);
      expect(series.add([2])).toEqual([3, 4]);
    });
    it('should subtract a series', () => {
      const series = new Series([3, 4]);
      expect(series.sub([1, 2])).toEqual([2, 2]);
      expect(series.sub([2])).toEqual([1, 2]);
    });
    it('should subtract a series', () => {
      const series = new Series([1, 2, 4]);
      expect(series.crossingOver([2, 3])).toBeTruthy();
      expect(series.crossingOver([2, 4])).toBeFalsy();
      expect(series.crossingOver([2])).toBeTruthy();
    });
    it('should compute the unbiased standard deviation', () => {
      const series = new Series([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(series.std()).toEqual(2.138089935299395);
    });
  });
});

import { KLine } from './k-line.interface';

export interface Strategy {
  init(): void;

  next(kLine: KLine): void;
}

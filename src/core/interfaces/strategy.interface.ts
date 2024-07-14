export interface Strategy {
  init(): void;

  next(): void;
}

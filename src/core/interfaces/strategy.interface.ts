export interface Strategy {
  init(): Promise<void>;

  next(): Promise<void>;
}

export interface Strategy {
  name: string;

  init(): Promise<void>;

  next(): Promise<void>;
}

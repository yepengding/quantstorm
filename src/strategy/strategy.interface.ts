export interface Strategy {
  name: string;

  init(args: string): Promise<void>;

  next(): Promise<void>;
}

export interface Strategy {
  id: string;

  init(args: string): Promise<void>;

  next(): Promise<void>;
}

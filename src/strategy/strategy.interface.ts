export interface Strategy {
  id: string;
  name: string;

  init(args: string): Promise<void>;

  next(): Promise<void>;
}

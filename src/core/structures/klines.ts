import { KLine } from '../interfaces/market.interface';

export class KLines {
  private readonly kLines: KLine[];

  constructor(kLines: KLine[]) {
    this.kLines = kLines;
  }

  public at(index: number): KLine {
    return this.kLines.at(index);
  }

  get length() {
    return this.kLines.length;
  }

  get open(): number[] {
    return this.kLines.map((l) => l.open);
  }

  get high(): number[] {
    return this.kLines.map((l) => l.high);
  }

  get low(): number[] {
    return this.kLines.map((l) => l.low);
  }

  get close(): number[] {
    return this.kLines.map((l) => l.close);
  }

  get volume(): number[] {
    return this.kLines.map((l) => l.volume);
  }
}

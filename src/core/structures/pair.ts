import { Currency } from '../constants';

export interface Pair {
  readonly base: Currency;
  readonly quote: Currency;

  toSymbol(): string;

  roundPrice(price: number): number;

  roundSize(quantity: number): number;
}

/**
 * Basic Pair Structure
 *
 * @author Yepeng Ding
 */
export class BasePair {
  public readonly base: Currency;
  public readonly quote: Currency;

  public constructor(base: string, quote: string) {
    this.base = base as Currency;
    this.quote = quote as Currency;
  }

  public static fromSymbol(symbol: string): Pair {
    const [base, quote] = symbol.split('/');
    return new BasePair(base as Currency, quote as Currency);
  }

  public roundPrice(price: number): number {
    return parseFloat(price.toFixed(priceDecimalMap.get(this.toSymbol())));
  }

  public roundSize(quantity: number): number {
    return parseFloat(quantity.toFixed(sizeDecimalMap.get(this.toSymbol())));
  }

  public toSymbol(): string {
    return `${this.base}/${this.quote}`;
  }
}

export class PerpetualPair extends BasePair {
  public readonly isInverse: boolean;

  constructor(base: string, quote: string, isInverse: boolean = false) {
    super(base, quote);
    this.isInverse = isInverse;
  }

  public static fromSymbol(symbol: string): PerpetualPair {
    const [pair, settlement] = symbol.split(':');
    const [base, quote] = pair.split('/');
    return new PerpetualPair(
      base as Currency,
      quote as Currency,
      base == settlement,
    );
  }

  public toPerpetualSymbol(): string {
    return `${this.base}/${this.quote}:${this.isInverse ? this.base : this.quote}`;
  }
}

const priceDecimalMap = new Map<string, number>([
  ['BTC/USDC', 1],
  ['BTC/USDC:USDC', 1],
  ['ETH/USDC', 2],
  ['ETH/USDC:USDC', 2],
  ['ETH/USD:ETH', 2],
]);

const sizeDecimalMap = new Map<string, number>([
  ['BTC/USDC', 3],
  ['BTC/USDC:USDC', 3],
  ['BTC/USD:BTC', 0],
  ['ETH/USDC', 3],
  ['ETH/USDC:USDC', 3],
  ['ETH/USD:ETH', 0],
  ['BTC/USDT', 3],
  ['BTC/USDT:USDT', 3],
  ['ETH/USDT', 3],
  ['ETH/USDT:USDT', 3],
  ['SOL/USDT', 0],
  ['SOL/USDT:USDT', 0],
  ['SOL/USDC', 0],
  ['SOL/USDC:USDC', 0],
]);

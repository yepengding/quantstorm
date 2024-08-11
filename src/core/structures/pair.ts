import { Currency } from '../constants';
import { NumUtil } from '../num.util';

export interface Pair {
  readonly base: Currency;
  readonly quote: Currency;

  toSymbol(): string;

  roundBasePrice(price: number): number;

  roundBaseSize(quantity: number): number;
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

  public roundBasePrice(price: number): number {
    return NumUtil.roundCurrencyPrice(price, this.base);
  }

  public roundBaseSize(quantity: number): number {
    return NumUtil.roundCurrencySize(quantity, this.base);
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

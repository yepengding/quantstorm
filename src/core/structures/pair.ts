import { Currency } from '../constants';
import { NumUtil } from '../num.util';

/**
 * Pair Structure
 *
 * @author Yepeng Ding
 */
export class Pair {
  public readonly base: Currency;
  public readonly quote: Currency;

  constructor(base: string, quote: string) {
    this.base = base as Currency;
    this.quote = quote as Currency;
  }

  public static fromSymbol(symbol: string): Pair {
    const [base, quote] = symbol.split('/');
    return new Pair(base as Currency, quote as Currency);
  }

  public static fromBinanceFuturesSymbol(symbol: string): Pair {
    const pair = symbol.split(':')[0];
    const [base, quote] = pair.split('/');
    return new Pair(base as Currency, quote as Currency);
  }

  public toSymbol(): string {
    return `${this.base}/${this.quote}`;
  }

  public toBinanceFuturesSymbol(): string {
    return `${this.base}/${this.quote}:${this.quote}`;
  }

  public roundBase(quantity: number): number {
    return NumUtil.roundCurrency(quantity, this.base);
  }
}

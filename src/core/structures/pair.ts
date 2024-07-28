import { Currency } from '../constants';

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

  public toSymbol(): string {
    return `${this.base}/${this.quote}`;
  }

  public toBinanceFuturesSymbol(): string {
    return `${this.base}/${this.quote}:${this.quote}`;
  }

  public roundBase(quantity: number): number {
    return parseFloat(quantity.toFixed(decimalMap.get(this.base)));
  }

  get baseDecimal() {
    return decimalMap.get(this.base);
  }

  get quoteDecimal() {
    return decimalMap.get(this.quote);
  }

  public static toPair(symbol: string): Pair {
    const [base, quote] = symbol.split('/');
    return new Pair(base as Currency, quote as Currency);
  }
}

const decimalMap = new Map<Currency, number>([
  [Currency.BTC, 3],
  [Currency.ETH, 3],
  [Currency.USDT, 3],
  [Currency.USDC, 3],
]);

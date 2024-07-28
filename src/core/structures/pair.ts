/**
 * Pair Structure
 *
 * @author Yepeng Ding
 */
export class Pair {
  public readonly base: SupportedCurrency;
  public readonly quote: SupportedCurrency;

  constructor(base: SupportedCurrency, quote: SupportedCurrency) {
    this.base = base;
    this.quote = quote;
  }

  public toSymbol(): string {
    return `${this.base}/${this.quote}`;
  }

  public toBinanceFuturesSymbol(): string {
    return `${this.base}/${this.quote}:${this.base}`;
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
    return new Pair(base as SupportedCurrency, quote as SupportedCurrency);
  }
}

const decimalMap = new Map<SupportedCurrency, number>([
  ['BTC', 3],
  ['ETH', 3],
  ['USDT', 3],
  ['USDC', 3],
]);

export type SupportedCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC';

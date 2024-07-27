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

  public static toPair(symbol: string): Pair {
    const [base, quote] = symbol.split('/');
    return new Pair(base as SupportedCurrency, quote as SupportedCurrency);
  }
}

export type SupportedCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC';

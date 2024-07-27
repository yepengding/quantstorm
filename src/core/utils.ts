import { Pair } from './interfaces/market.interface';

/**
 * Convert a symbol to a pair object
 *
 * @param symbol
 */
export function toPair(symbol: string): Pair {
  const [base, quote] = symbol.split('/');
  return {
    base: base,
    quote: quote,
  };
}

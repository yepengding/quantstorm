import { OptionSide } from '../constants';

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

export class OptionPair extends BasePair {
  public readonly date: string;
  public readonly strike: number;
  public readonly side: OptionSide;

  constructor(
    base: string,
    quote: string,
    date: string,
    strike: number,
    side: OptionSide,
  ) {
    super(base, quote);
    this.date = date;
    this.strike = strike;
    this.side = side;
  }

  public static fromSymbol(symbol: string): OptionPair {
    const [pair, name] = symbol.split(':');
    const [base, quote] = pair.split('/');
    const [, date, strike, side] = name.split('-');
    return new OptionPair(
      base as Currency,
      quote as Currency,
      date,
      Number(strike),
      side === 'C' ? OptionSide.CALL : OptionSide.PUT,
    );
  }

  public toOptionSymbol(): string {
    return `${this.base}/${this.quote}:${this.quote}-${this.date}-${this.strike}-${this.side}`;
  }
}

export enum Currency {
  USD = 'USD',
  BTC = 'BTC',
  ETH = 'ETH',
  XRP = 'XRP',
  BNB = 'BNB',
  SOL = 'SOL',
  PAXG = 'PAXG',
  USDT = 'USDT',
  USDC = 'USDC',
}

const priceDecimalMap = new Map<string, number>([
  ['BTC/USDT', 2],
  ['BTC/USDC', 2],
  ['BTC/USDC:USDC', 2],
  ['ETH/USDT', 2],
  ['ETH/USDC', 2],
  ['ETH/USDC:USDC', 2],
  ['ETH/USD:ETH', 2],
  ['BNB/USDT', 2],
  ['BNB/USDT:USDT', 2],
  ['BNB/USDC', 2],
  ['BNB/USDC:USDC', 2],
  ['SOL/USDT', 2],
  ['SOL/USDT:USDT', 2],
  ['SOL/USDC', 2],
  ['SOL/USDC:USDC', 2],
  ['PAXG/USDT', 2],
  ['PAXG/USDT:USDT', 2],
]);

const sizeDecimalMap = new Map<string, number>([
  ['BTC/USDC', 5],
  ['BTC/USDC:USDC', 3],
  ['BTC/USD:BTC', 0],
  ['ETH/USDC', 3],
  ['ETH/USDC:USDC', 3],
  ['ETH/USD:ETH', 0],
  ['BTC/USDT', 5],
  ['BTC/USDT:USDT', 3],
  ['ETH/USDT', 3],
  ['ETH/USDT:USDT', 3],
  ['BNB/USDT', 2],
  ['BNB/USDT:USDT', 2],
  ['BNB/USDC', 2],
  ['BNB/USDC:USDC', 2],
  ['SOL/USDT', 2],
  ['SOL/USDT:USDT', 2],
  ['SOL/USDC', 2],
  ['SOL/USDC:USDC', 2],
  ['PAXG/USDT', 4],
  ['PAXG/USDT:USDT', 3],
]);

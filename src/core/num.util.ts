import { Currency } from './constants';

export class NumUtil {
  public static roundCurrencyPrice(quantity: number, currency: Currency) {
    return parseFloat(quantity.toFixed(priceDecimalMap.get(currency)));
  }

  public static roundCurrencySize(quantity: number, currency: Currency) {
    return parseFloat(quantity.toFixed(sizeDecimalMap.get(currency)));
  }
}

const priceDecimalMap = new Map<Currency, number>([
  [Currency.BTC, 3],
  [Currency.ETH, 3],
  [Currency.XRP, 4],
  [Currency.BNB, 2],
  [Currency.USDT, 3],
  [Currency.USDC, 3],
]);

const sizeDecimalMap = new Map<Currency, number>([
  [Currency.BTC, 3],
  [Currency.ETH, 3],
  [Currency.XRP, 2],
  [Currency.BNB, 2],
  [Currency.USDT, 3],
  [Currency.USDC, 3],
]);

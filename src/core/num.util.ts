import { Currency } from './constants';

export class NumUtil {
  public static roundCurrency(quantity: number, currency: Currency) {
    return parseFloat(quantity.toFixed(decimalMap.get(currency)));
  }
}

const decimalMap = new Map<Currency, number>([
  [Currency.BTC, 3],
  [Currency.ETH, 3],
  [Currency.USDT, 3],
  [Currency.USDC, 3],
]);

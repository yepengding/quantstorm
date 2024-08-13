import { Currency } from '../../core/constants';
import { BalanceRecord, History } from './history';

/**
 * Backtesting Result Structure
 *
 * @author Yepeng Ding
 */
export class BacktestResult {
  private readonly history: History;

  constructor(history: History) {
    this.history = history;
  }

  getBalanceHistory(currency: Currency): BalanceRecord[] {
    return this.history.getBalanceHistory(currency);
  }

  getBalanceRange(currency: Currency): [number, number] {
    const balances = this.getBalanceHistory(currency).map((r) => r.balance);
    return [Math.min(...balances), Math.max(...balances)];
  }

  get tradeOrderHistory() {
    return this.history.getTradeOrderHistory();
  }
}

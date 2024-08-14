import { Currency } from '../../core/constants';
import {
  BalanceRecords,
  History,
  HistoryRecords,
  OrderRecords,
} from './history';

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

  getBalanceRecords(currency: Currency): BalanceRecords {
    return this.history.getBalanceHistory(currency);
  }

  get orderRecords(): OrderRecords {
    return this.history.getTradeOrderHistory();
  }

  get historyRecords(): HistoryRecords {
    return this.history.allRecords;
  }

  getBalanceRange(currency: Currency): [number, number] {
    const balances = this.getBalanceRecords(currency).map((r) => r.balance);
    return [Math.min(...balances), Math.max(...balances)];
  }
}

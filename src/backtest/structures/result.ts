import { Currency } from '../../core/constants';
import {
  BalanceRecord,
  BalanceRecords,
  HistoryRecords,
  TradeRecord,
  TradeRecords,
} from './history';

/**
 * Backtesting Result Structure
 *
 * @author Yepeng Ding
 */
export class BacktestResult {
  private readonly records: HistoryRecords;

  constructor(records: HistoryRecords) {
    this.records = records;
  }

  getBalanceRecords(currency: Currency): BalanceRecords {
    return this.records.map((record) => {
      return {
        timestamp: record.timestamp,
        balance: record.balances.get(currency),
      } as BalanceRecord;
    });
  }

  get filledOrderRecords(): TradeRecords {
    return this.records.map((record) => {
      return {
        timestamp: record.timestamp,
        trades: record.trades,
      } as TradeRecord;
    });
  }

  get historyRecords(): HistoryRecords {
    return this.records;
  }

  getBalanceRange(currency: Currency): [number, number] {
    const balances = this.getBalanceRecords(currency).map((r) => r.balance);
    return [Math.min(...balances), Math.max(...balances)];
  }
}

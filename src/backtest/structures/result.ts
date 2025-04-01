import { Currency } from '../../core/constants';
import {
  BalanceRecord,
  BalanceRecords,
  HistoryRecords,
  TradeRecord,
  TradeRecords,
} from './history';
import { BasePair } from '../../core/structures/pair';

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

  get tradeRecords(): TradeRecords {
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
    return [this.get_min(balances), this.get_max(balances)];
  }

  getMaxDrawdown(currency: Currency): number {
    let maxDrawdown: number = 0;
    let drawdown: number = 0;
    this.records.forEach((record) => {
      const pnl = record.trades
        .filter((trade) => BasePair.fromSymbol(trade.symbol).quote == currency)
        .reduce((acc, pre) => acc + pre.pnl, 0);
      if (pnl < 0) {
        drawdown += pnl;
      } else {
        maxDrawdown = Math.min(maxDrawdown, drawdown);
        drawdown = 0;
      }
    });
    return Math.min(maxDrawdown, drawdown);
  }

  private get_max(arr: number[]): number {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  }

  private get_min(arr: number[]): number {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  }
}

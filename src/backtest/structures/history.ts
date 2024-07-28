import { Order } from '../../core/interfaces/market.interface';
import { Currency } from '../../core/constants';

/**
 * Backtesting History Structure
 *
 * @author Yepeng Ding
 */
export class History {
  private readonly records: HistoryRecord[];

  private currentRecord: HistoryRecord;

  constructor() {
    this.records = [];
    this.currentRecord = null;
  }

  addTradeOrder(order: Order) {
    this.currentRecord.tradeOrders.push(order);
  }

  start(timestamp: number, balances: Map<string, number>) {
    if (this.currentRecord) {
      this.records.push(this.currentRecord);
    }
    this.currentRecord = {
      timestamp: timestamp,
      tradeOrders: [],
      balances: balances,
    };
  }

  getBalanceHistory(currency: string): BalanceRecord[] {
    return this.records.map((record) => {
      return {
        timestamp: record.timestamp,
        balance: record.balances.get(currency),
      } as BalanceRecord;
    });
  }

  getTradeOrderHistory(): Order[][] {
    return this.records.map((record) => record.tradeOrders);
  }
}

export type HistoryRecord = {
  timestamp: number;
  tradeOrders: Order[];
  balances: Map<string, number>;
};

export type BacktestHistory = {
  tradeOrderHistory: Order[][];

  balanceHistory: Map<Currency, BalanceRecord[]>;
};

export type BalanceRecord = {
  timestamp: number;
  balance: number;
};

import { Order } from '../../core/interfaces/market.interface';

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

  addOrder(order: Order) {
    this.currentRecord.orders.push(order);
  }

  start(timestamp: number, balances: Map<string, number>) {
    if (this.currentRecord) {
      this.records.push(this.currentRecord);
    }
    this.currentRecord = {
      timestamp: timestamp,
      orders: [],
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

  getOrderHistory(): Order[][] {
    return this.records.map((record) => record.orders);
  }
}

export type HistoryRecord = {
  timestamp: number;
  orders: Order[];
  balances: Map<string, number>;
};

export type BacktestHistory = {
  orderHistory: Order[][];

  balanceHistory: Map<string, BalanceRecord[]>;
};

export type BalanceRecord = {
  timestamp: number;
  balance: number;
};

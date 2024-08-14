import { Order } from '../../core/interfaces/market.interface';

/**
 * Backtesting History Structure
 *
 * @author Yepeng Ding
 */
export class History {
  private readonly records: MutableHistoryRecord[];

  private currentRecord: MutableHistoryRecord;

  constructor() {
    this.records = [];
    this.currentRecord = null;
  }

  addTradeOrder(order: Order) {
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

  getBalanceHistory(currency: string): BalanceRecords {
    return this.records.map((record) => {
      return {
        timestamp: record.timestamp,
        balance: record.balances.get(currency),
      } as BalanceRecord;
    });
  }

  getTradeOrderHistory(): OrderRecords {
    return this.records.map((record) => {
      return {
        timestamp: record.timestamp,
        orders: record.orders,
      } as OrderRecord;
    });
  }

  get allRecords(): HistoryRecords {
    return this.records;
  }
}

type MutableHistoryRecord = {
  timestamp: number;
  orders: Order[];
  balances: Map<string, number>;
};

export type HistoryRecord = {
  timestamp: number;
  orders: ReadonlyArray<Readonly<Order>>;
  balances: Map<string, number>;
};

export type OrderRecord = {
  timestamp: number;
  orders: ReadonlyArray<Readonly<Order>>;
};

export type BalanceRecord = {
  timestamp: number;
  balance: number;
};

export type HistoryRecords = ReadonlyArray<HistoryRecord>;

export type OrderRecords = ReadonlyArray<OrderRecord>;

export type BalanceRecords = ReadonlyArray<BalanceRecord>;

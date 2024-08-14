import { Trade } from '../../core/interfaces/market.interface';

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

  addTrade(trade: Trade) {
    this.currentRecord.trades.push(trade);
  }

  start(timestamp: number, balances: Map<string, number>) {
    if (this.currentRecord) {
      this.records.push(this.currentRecord);
    }
    this.currentRecord = {
      timestamp: timestamp,
      trades: [],
      balances: balances,
    };
  }

  get allRecords(): HistoryRecords {
    return this.records;
  }
}

type MutableHistoryRecord = {
  timestamp: number;
  trades: Trade[];
  balances: Map<string, number>;
};

export type HistoryRecord = {
  timestamp: number;
  trades: ReadonlyArray<Readonly<Trade>>;
  balances: Map<string, number>;
};

export type TradeRecord = {
  timestamp: number;
  trades: ReadonlyArray<Readonly<Trade>>;
};

export type BalanceRecord = {
  timestamp: number;
  balance: number;
};

export type HistoryRecords = ReadonlyArray<HistoryRecord>;

export type TradeRecords = ReadonlyArray<TradeRecord>;

export type BalanceRecords = ReadonlyArray<BalanceRecord>;

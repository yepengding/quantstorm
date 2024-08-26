import { Trade } from '../../core/interfaces/market.interface';
import { TradeSide } from '../../core/constants';

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

  /**
   * Finalize current record and clear buffer
   *
   * @param timestamp
   * @param balances
   */
  flush(timestamp: number, balances: Map<string, number>) {
    if (this.currentRecord) {
      this.currentRecord.trades = this.sortTrades(this.currentRecord.trades);
      this.records.push(this.currentRecord);
    }
    this.currentRecord = {
      timestamp: timestamp,
      trades: [],
      balances: balances,
    };
  }

  private sortTrades(trades: Trade[]): Trade[] {
    const longTrades = trades
      .filter((t) => t.side == TradeSide.LONG)
      .sort((a, b) => (a.price > b.price ? -1 : a.price < b.price ? 1 : 0));

    const shortTrades = trades
      .filter((t) => t.side == TradeSide.SHORT)
      .sort((a, b) => a.price - b.price);
    return longTrades.concat(shortTrades);
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

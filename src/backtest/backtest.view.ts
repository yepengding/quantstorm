import { KLine } from '../core/interfaces/market.interface';
import { TradeSide } from '../core/constants';
import { ChartBalance, ChartKLine, ChartTrades } from './backtest.view.type';
import { BalanceRecords, TradeRecords } from './structures/history';

export function toCharKLines(kLines: KLine[]): ChartKLine[] {
  return kLines.map((k) => {
    return {
      x: k.timestamp * 1000,
      o: k.open,
      h: k.high,
      l: k.low,
      c: k.close,
    };
  });
}

export function toChartTrades(tradeRecords: TradeRecords): ChartTrades {
  const chartTrades = { long: [], short: [] };
  for (const record of tradeRecords) {
    for (const trade of record.trades) {
      if (trade.side == TradeSide.LONG) {
        chartTrades.long.push({
          x: trade.timestamp * 1000,
          y: trade.price - 10,
        });
      } else if (trade.side == TradeSide.SHORT) {
        chartTrades.short.push({
          x: trade.timestamp * 1000,
          y: trade.price + 10,
        });
      }
    }
  }
  return chartTrades;
}

export function toChartBalance(balanceHistory: BalanceRecords): ChartBalance[] {
  return balanceHistory.map((record) => {
    return { x: record.timestamp * 1000, y: record.balance };
  });
}

export function toOrderHistoryText(orderRecords: TradeRecords): string[] {
  return orderRecords
    .map((record) => record.trades)
    .filter((trades) => trades.length > 0)
    .flatMap((trades) =>
      trades.map(
        (trade) =>
          `${toDateString(trade.timestamp)} ${trade.side == TradeSide.LONG ? 'Long' : 'Short'} ${trade.size} ${trade.symbol} at ${trade.price}`,
      ),
    );
}

function toDateString(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const yyyy = `${date.getFullYear()}`;
  const MM = `0${date.getMonth() + 1}`.slice(-2);
  const dd = `0${date.getDate()}`.slice(-2);
  const HH = `0${date.getHours()}`.slice(-2);
  const mm = `0${date.getMinutes()}`.slice(-2);
  const ss = `0${date.getSeconds()}`.slice(-2);

  return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
}

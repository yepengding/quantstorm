import { KLine, Order } from '../core/interfaces/market.interface';
import { TradeSide } from '../core/constants';
import { ChartBalance, ChartKLine, ChartOrders } from './backtest.view.type';
import { BalanceRecord } from './structures/history';

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

export function toChartOrders(orderHistory: Order[][]): ChartOrders {
  const chartOrders = { long: [], short: [] };
  for (const orders of orderHistory) {
    for (const order of orders) {
      if (order.side == TradeSide.LONG) {
        chartOrders.long.push({
          x: order.timestamp * 1000,
          y: order.price - 10,
        });
      } else if (order.side == TradeSide.SHORT) {
        chartOrders.short.push({
          x: order.timestamp * 1000,
          y: order.price + 10,
        });
      }
    }
  }
  return chartOrders;
}

export function toChartBalance(
  balanceHistory: BalanceRecord[],
): ChartBalance[] {
  return balanceHistory.map((record) => {
    return { x: record.timestamp * 1000, y: record.balance };
  });
}

export function toOrderHistoryText(orderHistory: Order[][]): string[] {
  return orderHistory
    .filter((orders) => orders.length > 0)
    .flatMap((orders) =>
      orders.map(
        (order) =>
          `${toDateString(order.timestamp)} ${order.side == TradeSide.LONG ? 'Long' : 'Short'} ${order.size} ${order.symbol} at ${order.price}`,
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

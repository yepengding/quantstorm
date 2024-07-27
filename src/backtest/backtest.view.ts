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

export function toOrderHistoryText(orderHistory: Order[][]): string {
  return orderHistory
    .filter((orders) => orders.length > 0)
    .map((orders) =>
      orders
        .map(
          (order) =>
            `${order.side == TradeSide.LONG ? 'Long' : 'Short'} ${order.size} ${order.symbol} at ${order.price}`,
        )
        .join('\n'),
    )
    .join('\n');
}

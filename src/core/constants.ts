export const DEFAULT_KLINE_LIMIT = 100;

export enum OrderType {
  LIMIT = 0,
  MARKET = 1,
}

export enum OrderStatus {
  OPEN = 0,
  FILLED = 1,
  CANCELLED = -1,
}

export enum TradeSide {
  SHORT = -1,
  LONG = 1,
}

export enum Currency {
  USD = 'USD',
  BTC = 'BTC',
  ETH = 'ETH',
  XRP = 'XRP',
  BNB = 'BNB',
  USDT = 'USDT',
  USDC = 'USDC',
}

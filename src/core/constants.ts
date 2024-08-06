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
  BTC = 'BTC',
  ETH = 'ETH',
  BNB = 'BNB',
  USDT = 'USDT',
  USDC = 'USDC',
}

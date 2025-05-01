# Quantstorm

A quants-centric trading system.

## Installation

1. Install [pnpm](https://pnpm.io/)
2. Use pnpm to install dependencies

```bash
$ pnpm install
```

## Backtesting

### Set Environment Variables

Set environment variables in `.env` by referring to `.env.example`

### Run Quantstorm

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Build Backtesting Data

Access the endpoint `/backtest/build/kline` with params:

- *base*: Base currency
- *quote*: Quote currency
- *interval*: K-line interval
- *start*: start date in format 'YYYY-MM-DD'
- *end*: end date in format 'YYYY-MM-DD'

### Run Strategy

Access the endpoint `/backtest/strategy/{strategy}` with params:

- *start* The start UNIX timestamp
- *end* The end UNIX timestamp
- *interval* The execution interval, e.g., '1m', '15m', '1h'
- *base*: Base currency for visualization
- *quote*: Quote currency for visualization and balance calculation

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Quantstorm

A quants-centric trading system.

## Installation

```bash
$ npm install
```

## Backtesting

Run Quantstorm

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Access the endpoint `/backtest/{strategy}` with params:

- *start* The start timestamp
- *end* The end timestamp
- *interval* The execution interval, e.g., '1m', '15m', '1h'

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

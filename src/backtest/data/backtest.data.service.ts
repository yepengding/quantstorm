import { Injectable } from '@nestjs/common';

import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import { ConfigService } from '@nestjs/config';
import { KLine } from '../../core/interfaces/k-line.interface';
import { StrategyAbstract } from '../../strategy/strategy.abstract';

/**
 * Backtest Data Service
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestDataService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Load K-lines from Binance CSV
   * @param strategy strategy to handle K-lines
   */
  public async feedKLinesInBinanceCSVTo(
    strategy: StrategyAbstract,
  ): Promise<void> {
    const parser = fs
      .createReadStream(this.configService.get<string>('backtest.dataPath'))
      .pipe(
        parse({
          columns: true,
        }),
      );
    for await (const record of parser) {
      strategy.next(this.parseBinanceCSVRecord(record));
    }
  }

  private parseBinanceCSVRecord(record: any): KLine {
    return {
      open: record['open'],
      high: record['high'],
      low: record['low'],
      close: record['close'],
      volume: record['volume'],
    };
  }
}

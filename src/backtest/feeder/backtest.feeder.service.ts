import { Injectable } from '@nestjs/common';

import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import { ConfigService } from '@nestjs/config';
import { KLine } from '../../core/interfaces/market.interface';
import { Interval } from '../../core/types';
import { join } from 'node:path';

/**
 * Backtest Data Feeder Service
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestFeederService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Load K-lines from Binance CSV
   * @param symbol symbol
   * @param interval interval
   * @param clockTimestamp current clock timestamp
   * @param limit max number of K-lines
   * @return K-line list starting from clockTimestamp
   */
  public async getKLinesInBinanceCSV(
    symbol: string,
    interval: Interval,
    clockTimestamp: number,
    limit: number,
  ): Promise<KLine[]> {
    const kLines = [];
    const parser = fs
      .createReadStream(
        join(
          this.configService.get<string>('backtest.dataPath'),
          this.getBinanceCSVFilename(symbol, interval),
        ),
      )
      .pipe(
        parse({
          columns: true,
        }),
      );
    for await (const record of parser) {
      const kLine = this.getKLineFromBinanceCSVRecord(record);
      if (kLine.timestamp > clockTimestamp) {
        break;
      }
      kLines.push(kLine);
      if (kLines.length > limit) {
        kLines.shift();
      }
    }
    return kLines;
  }

  private getBinanceCSVFilename(symbol: string, interval: Interval): string {
    return `${symbol.replace(/\//g, '')}-${interval}.csv`;
  }

  private getKLineFromBinanceCSVRecord(record: any): KLine {
    return {
      open: parseFloat(record['open']),
      high: parseFloat(record['high']),
      low: parseFloat(record['low']),
      close: parseFloat(record['close']),
      volume: parseFloat(record['volume']),
      timestamp: parseInt(record['close_time'].slice(0, -3)),
    };
  }
}

import { Injectable } from '@nestjs/common';

import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import { ConfigService } from '@nestjs/config';
import { KLine } from '../../core/interfaces/k-line.interface';

/**
 * Backtest Data Service
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestDataService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Load K-lines from Binance CSV
   * @param clockTimestamp current clock timestamp
   * @param limit max number of K-lines
   * @return K-line list starting from clockTimestamp
   */
  public async getKLinesInBinanceCSV(
    clockTimestamp: number,
    limit: number,
  ): Promise<KLine[]> {
    const kLines = [];
    const parser = fs
      .createReadStream(this.configService.get<string>('backtest.dataPath'))
      .pipe(
        parse({
          columns: true,
        }),
      );
    for await (const record of parser) {
      const kLine = this.parseBinanceCSVRecord(record);
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

  private parseBinanceCSVRecord(record: any): KLine {
    return {
      open: parseInt(record['open']),
      high: parseInt(record['high']),
      low: parseInt(record['low']),
      close: parseInt(record['close']),
      volume: parseInt(record['volume']),
      timestamp: parseInt(record['close_time'].slice(0, -3)),
    };
  }
}

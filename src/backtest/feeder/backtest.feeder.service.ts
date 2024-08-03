import { Injectable } from '@nestjs/common';

import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import { ConfigService } from '@nestjs/config';
import { KLine } from '../../core/interfaces/market.interface';
import { Interval } from '../../core/types';
import { join } from 'node:path';
import { Pair } from '../../core/structures/pair';

/**
 * Backtest Data Feeder Service
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestFeederService {
  private readonly dataCache: Map<string, KLine[]>;

  private readonly dataCacheSize: number;

  constructor(private readonly configService: ConfigService) {
    this.dataCache = new Map<string, KLine[]>();
    this.dataCacheSize = this.configService.get<number>(
      'backtest.dataCacheSize',
    );
  }

  public async getBinanceKLines(
    pair: Pair,
    interval: Interval,
    clockTimestamp: number,
    limit: number = 10,
  ): Promise<KLine[]> {
    const data = this.dataCache.get(this.getBinanceCSVName(pair, interval));
    if (data && data.length > 1 && data.at(-1).timestamp > clockTimestamp) {
      const kLines = [];
      for (const kLine of data) {
        if (kLine.timestamp > clockTimestamp) {
          break;
        }
        kLines.push(kLine);
        if (kLines.length > limit) {
          kLines.shift();
        }
      }
      return kLines;
    } else {
      return await this.getKLinesInBinanceCSV(
        pair,
        interval,
        clockTimestamp,
        limit,
      );
    }
  }

  /**
   * Load K-lines from Binance CSV to memory cache
   * @param pair pair
   * @param interval interval
   * @param clockTimestamp current clock timestamp
   * @param limit max number of K-lines
   * @return K-line list observable at the clockTimestamp
   */
  private async getKLinesInBinanceCSV(
    pair: Pair,
    interval: Interval,
    clockTimestamp: number,
    limit: number = 10,
  ): Promise<KLine[]> {
    const kLinesForCache = [];
    const kLines = [];
    const parser = fs
      .createReadStream(
        join(
          this.configService.get<string>('backtest.dataPath'),
          this.getBinanceCSVName(pair, interval),
        ),
      )
      .pipe(
        parse({
          columns: true,
        }),
      );
    for await (const record of parser) {
      if (kLinesForCache.length > this.dataCacheSize) {
        break;
      }
      const kLine = this.getKLineFromBinanceCSVRecord(record);
      kLinesForCache.push(kLine);
      if (kLine.timestamp > clockTimestamp) {
        // Continue loading into cache
        continue;
      }
      kLines.push(kLine);
      if (kLines.length > limit) {
        kLinesForCache.shift();
        kLines.shift();
      }
    }

    this.dataCache.set(this.getBinanceCSVName(pair, interval), kLinesForCache);
    return kLines;
  }

  private getBinanceCSVName(pair: Pair, interval: string): string {
    return `${pair.base}${pair.quote}-${interval}.csv`;
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

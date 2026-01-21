import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import { parse } from 'csv-parse';
import { KLine } from '../../core/interfaces/market.interface';
import { Interval } from '../../core/types';
import { join } from 'node:path';
import { Pair } from '../../core/structures/pair';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment/moment';
import { EOL } from 'node:os';
import * as AdmZip from 'adm-zip';
import { toTimestampInterval } from '../backtest.utils';
import { FeederConfig } from '../../broker/backtest/backtest.interface';

/**
 * Backtest Data Feeder Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class BacktestFeederService {
  private readonly dataCacheSize: number;
  private readonly dataPath: string;

  private readonly dataCache: Map<string, KLine[]>;

  private readonly httpService: HttpService;

  constructor(config: FeederConfig) {
    this.dataCache = new Map<string, KLine[]>();
    this.dataCacheSize = config.dataCacheSize;
    this.dataPath = config.dataPath;
    this.httpService = new HttpService();
  }

  /**
   * Get Binance K-lines
   *
   * @param pair
   * @param interval
   * @param clockTimestamp
   * @param limit
   */
  public async getBinanceKLines(
    pair: Pair,
    interval: Interval,
    clockTimestamp: number,
    limit: number = 10,
  ): Promise<KLine[]> {
    const startTimestamp =
      clockTimestamp - toTimestampInterval(interval) * limit;
    let data = this.dataCache.get(this.getBinanceCSVName(pair, interval));
    if (
      !data ||
      data.length == 0 ||
      !(
        data.at(0).timestamp < startTimestamp &&
        data.at(-1).timestamp > clockTimestamp
      )
    ) {
      await this.loadKLinesFromBinanceCSV(pair, interval, startTimestamp);
      data = this.dataCache.get(this.getBinanceCSVName(pair, interval));
    }
    const kLines = [];
    for (const kLine of data) {
      if (kLine.timestamp > clockTimestamp) {
        break;
      } else if (kLine.timestamp > startTimestamp) {
        kLines.push(kLine);
        if (kLines.length > limit) {
          kLines.shift();
        }
      }
    }
    return kLines;
  }

  /**
   * Load K-lines from Binance CSV to memory cache
   * @param pair pair
   * @param interval interval
   * @param startTimestamp start timestamp
   * @return K-line list observable at the clockTimestamp
   */
  private async loadKLinesFromBinanceCSV(
    pair: Pair,
    interval: Interval,
    startTimestamp: number,
  ): Promise<void> {
    const kLinesForCache = [];
    const parser = fs
      .createReadStream(
        join(this.dataPath, this.getBinanceCSVName(pair, interval)),
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
      if (kLine.timestamp > startTimestamp) {
        kLinesForCache.push(kLine);
      }
    }
    this.dataCache.set(this.getBinanceCSVName(pair, interval), kLinesForCache);
  }

  /**
   * Build Binance K-line data set
   *
   * @param pair
   * @param interval
   * @param startDate yyyy-mm-dd
   * @param endDate yyyy-mm-dd
   */
  public async buildBinanceKLineData(
    pair: Pair,
    interval: Interval,
    startDate: string,
    endDate: string,
  ): Promise<string> {
    // Compute dates
    const currentMoment = moment(startDate);
    const endMoment = moment(endDate);
    const dates = [];
    while (currentMoment.isSameOrBefore(endMoment)) {
      dates.push(currentMoment.format('YYYY-MM-DD'));
      currentMoment.add(1, 'day');
    }

    // Download data
    await this.downloadBinanceKLines(pair, interval, dates);

    // Create dataset file
    const pathToDataFile = join(
      this.dataPath,
      `${this.getBinanceCSVName(pair, interval)}`,
    );
    fs.writeFileSync(
      pathToDataFile,
      `open_time,open,high,low,close,volume,close_time,quote_volume,count,taker_buy_volume,taker_buy_quote_volume,ignore${EOL}`,
    );
    // Append the data to file
    for (const date of dates) {
      fs.appendFileSync(
        pathToDataFile,
        this.getContentInBinanceKLineZip(pair, interval, date, true),
      );
    }

    return pathToDataFile;
  }

  /**
   * Download K-line data from Binance
   *
   * @param pair
   * @param interval
   * @param dates set of dates in format 'YYYY-MM-DD'
   */
  async downloadBinanceKLines(pair: Pair, interval: Interval, dates: string[]) {
    for (const date of dates) {
      const zipFilename = this.getBinanceZipName(pair, interval, date);
      const writer = fs.createWriteStream(join(this.dataPath, zipFilename));
      await this.httpService
        .axiosRef({
          url: `https://data.binance.vision/data/futures/um/daily/klines/${pair.base}${pair.quote}/${interval}/${zipFilename}`,
          method: 'GET',
          responseType: 'stream',
        })
        .then((res) => {
          return new Promise((resolve, reject) => {
            res.data.pipe(writer);
            let error = null;
            writer.on('error', (err) => {
              error = err;
              writer.close();
              reject(err);
            });
            writer.on('close', () => {
              if (!error) {
                resolve(true);
              }
            });
          });
        });
    }
  }

  /**
   * Get content of the CSV file in a Binance K-line data zip file
   *
   * @param pair
   * @param interval
   * @param date
   * @param removeHeader if true, then remove CSV header
   * @private
   */
  private getContentInBinanceKLineZip(
    pair: Pair,
    interval: Interval,
    date: string,
    removeHeader: boolean = false,
  ): string {
    const zipFile = new AdmZip(
      join(this.dataPath, this.getBinanceZipName(pair, interval, date)),
    );
    const content = zipFile
      .getEntry(`${this.getBinanceCSVName(pair, interval, date)}`)
      .getData()
      .toString();
    return removeHeader
      ? content.substring(content.indexOf('\n') + 1)
      : content;
  }

  private getBinanceZipName(pair: Pair, interval: Interval, date: string) {
    return `${pair.base}${pair.quote}-${interval}-${date}.zip`;
  }

  private getBinanceCSVName(
    pair: Pair,
    interval: string,
    date?: string,
  ): string {
    return date
      ? `${pair.base}${pair.quote}-${interval}-${date}.csv`
      : `${pair.base}${pair.quote}-${interval}.csv`;
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

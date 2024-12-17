import { ConsoleLogger, Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'node:fs';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';
import * as os from 'node:os';

/**
 * Logger Service
 *
 * @author Yepeng Ding
 */
@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly rootPath: string;

  private readonly streamMap: Map<string, WriteStream>;

  constructor(private readonly configService: ConfigService) {
    super();
    moment.tz.setDefault('Asia/Tokyo');
    this.rootPath = this.configService.get('log.path');
    this.streamMap = new Map<string, WriteStream>();
  }

  fatal(message: any, context?: string) {
    super.fatal(message, context);
    this.appendToLog('FATAL', message.toString(), context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.appendToLog('ERROR', message.toString(), context);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.appendToLog('WARN', message.toString(), context);
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.appendToLog('LOG', message.toString(), context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.appendToLog('DEBUG', message.toString(), context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.appendToLog('VERBOSE', message.toString(), context);
  }

  getTimestamp(): string {
    return moment().format();
  }

  private appendToLog(level: string, message: string, context?: string) {
    const time = moment(this.getTimestamp());
    this.appendToDailyLog(time, level, message.toString(), context);
    this.appendToContextLog(time, level, message.toString(), context);
  }

  private appendToDailyLog(
    time: Moment,
    level: string,
    message: string,
    context?: string,
  ) {
    const dirPath = join(this.rootPath, time.format('YYYYMMDD'));
    const filePath = join(dirPath, `${time.format('YYYYMMDD')}.log`);
    if (!this.streamMap.has(filePath)) {
      this.checkLogDirPath(dirPath);
      this.streamMap.set(filePath, createWriteStream(filePath, { flags: 'a' }));
      // Collect outdated streams
      this.streamMap.forEach((stream, key) => {
        if (!key.endsWith(`${time.format('YYYYMMDD')}.log`)) {
          stream.end();
          this.streamMap.delete(key);
        }
      });
    }
    this.streamMap
      .get(filePath)
      .write(
        `${time.format()}, ${level}, ${context ? context : ''}, ${message.toString()}${os.EOL}`,
      );
  }

  private appendToContextLog(
    time: Moment,
    level: string,
    message: string,
    context?: string,
  ) {
    if (!!context) {
      const dirPath = join(this.rootPath, time.format('YYYYMMDD'), 'context');
      const filePath = join(
        dirPath,
        `${context}-${time.format('YYYYMMDD')}.log`,
      );
      if (!this.streamMap.has(filePath)) {
        this.checkLogDirPath(dirPath);
        this.streamMap.set(
          filePath,
          createWriteStream(filePath, { flags: 'a' }),
        );
        // Collect outdated streams
        this.streamMap.forEach((stream, key) => {
          if (!key.endsWith(`${time.format('YYYYMMDD')}.log`)) {
            stream.end();
            this.streamMap.delete(key);
          }
        });
      }
      this.streamMap
        .get(filePath)
        .write(
          `${time.format()}, ${level}, ${context ? context : ''}, ${message.toString()}${os.EOL}`,
        );
    }
  }

  private checkLogDirPath(path: string) {
    if (!existsSync(path)) {
      mkdirSync(path, {
        recursive: true,
      });
    }
  }
}

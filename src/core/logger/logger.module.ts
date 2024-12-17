import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Logger Module
 *
 * @author Yepeng Ding
 */
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

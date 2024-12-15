import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StrategyModule } from './strategy/strategy.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BacktestModule } from './backtest/backtest.module';
import configuration from './core/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrategyState } from './executor/executor.dao';
import { ExecutorModule } from './executor/executor.module';

/**
 * App Module
 * @author Yepeng Ding
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: join(
          configService.get<string>('db.path'),
          'quantstorm.sqlite3',
        ),
        entities: [StrategyState],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    StrategyModule,
    BacktestModule,
    ExecutorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

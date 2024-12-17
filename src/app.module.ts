import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StrategyModule } from './strategy/strategy.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BacktestModule } from './backtest/backtest.module';
import configuration from './core/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'node:path';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { StrategyState } from './executor/executor.dao';
import { ExecutorModule } from './executor/executor.module';
import { LoggerModule } from './core/logger/logger.module';

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
      useFactory: (configService: ConfigService) => {
        let config: TypeOrmModuleOptions;
        switch (configService.get<string>('db.type')) {
          case 'mariadb': {
            config = {
              type: 'mariadb',
              host: configService.get<string>('db.host'),
              port: configService.get<number>('db.port'),
              username: configService.get<string>('db.username'),
              password: configService.get<string>('db.password'),
              database: `${configService.get<string>('db.name')}`,
            };
            break;
          }
          default: {
            config = {
              type: 'sqlite',
              database: join(
                configService.get<string>('db.path'),
                `${configService.get<string>('db.name')}.sqlite3`,
              ),
            };
          }
        }
        return {
          ...config,
          entities: [StrategyState],
          synchronize: true,
        } as TypeOrmModuleOptions;
      },
      inject: [ConfigService],
    }),
    StrategyModule,
    BacktestModule,
    ExecutorModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

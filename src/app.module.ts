import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StrategyModule } from './strategy/strategy.module';
import { ConfigModule } from '@nestjs/config';
import { BacktestModule } from './backtest/backtest.module';
import { BacktestBrokerService } from './backtest/broker/backtest.broker.service';
import { BacktestFeederService } from './backtest/feeder/backtest.feeder.service';
import { BinanceModule } from './binance/binance.module';
import configuration from './core/config';

/**
 * App Module
 * @author Yepeng Ding
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    StrategyModule,
    BacktestModule,
    BinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, BacktestBrokerService, BacktestFeederService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StrategyModule } from './strategy/strategy.module';
import { ConfigModule } from '@nestjs/config';
import { BacktestModule } from './backtest/backtest.module';
import { StrategyRegistryService } from './strategy/strategy.registry.service';
import { BacktestBrokerService } from './backtest/backtest.broker.service';
import configuration from './core/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    StrategyModule,
    BacktestModule,
  ],
  controllers: [AppController],
  providers: [AppService, StrategyRegistryService, BacktestBrokerService],
})
export class AppModule {}

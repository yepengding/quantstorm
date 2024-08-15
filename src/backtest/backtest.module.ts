import { Module } from '@nestjs/common';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { StrategyModule } from '../strategy/strategy.module';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrategyState } from '../strategy/strategy.dao';

/**
 * Backtest Module
 * @author Yepeng Ding
 */
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([StrategyState]),
    StrategyModule,
  ],
  controllers: [BacktestController],
  providers: [BacktestService, BacktestBrokerService, BacktestFeederService],
})
export class BacktestModule {}

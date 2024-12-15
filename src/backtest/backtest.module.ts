import { Module } from '@nestjs/common';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { StrategyModule } from '../strategy/strategy.module';
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
  providers: [BacktestService],
})
export class BacktestModule {}

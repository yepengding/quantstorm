import { Module } from '@nestjs/common';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { StrategyModule } from '../strategy/strategy.module';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestDataService } from './data/backtest.data.service';

/**
 * Backtest Module
 * @author Yepeng Ding
 */
@Module({
  imports: [StrategyModule],
  controllers: [BacktestController],
  providers: [BacktestService, BacktestBrokerService, BacktestDataService],
})
export class BacktestModule {}

import { Module } from '@nestjs/common';
import { BinanceBrokerService } from './broker/binance.broker.service';
import { BinanceService } from './binance.service';
import { BinanceController } from './binance.controller';
import { StrategyModule } from '../strategy/strategy.module';

/**
 * Binance Module
 *
 * @author Yepeng Ding
 */
@Module({
  imports: [StrategyModule],
  controllers: [BinanceController],
  providers: [BinanceService, BinanceBrokerService],
})
export class BinanceModule {}

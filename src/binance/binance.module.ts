import { Module } from '@nestjs/common';

import { BinancePerpService } from './perp/binance.perp.service';
import { BinanceController } from './binance.controller';
import { StrategyModule } from '../strategy/strategy.module';
import { BinancePerpBrokerService } from './perp/broker/binance.perp.broker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrategyState } from '../strategy/strategy.dao';

/**
 * Binance Module
 *
 * @author Yepeng Ding
 */
@Module({
  imports: [TypeOrmModule.forFeature([StrategyState]), StrategyModule],
  controllers: [BinanceController],
  providers: [BinancePerpService, BinancePerpBrokerService],
})
export class BinanceModule {}

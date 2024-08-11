import { Module } from '@nestjs/common';

import { BinancePerpService } from './perp/binance.perp.service';
import { BinanceController } from './binance.controller';
import { StrategyModule } from '../strategy/strategy.module';
import { BinancePerpBrokerService } from './perp/broker/binance.perp.broker.service';

/**
 * Binance Module
 *
 * @author Yepeng Ding
 */
@Module({
  imports: [StrategyModule],
  controllers: [BinanceController],
  providers: [BinancePerpService, BinancePerpBrokerService],
})
export class BinanceModule {}

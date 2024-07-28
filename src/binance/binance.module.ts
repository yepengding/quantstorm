import { Module } from '@nestjs/common';
import { BinanceBrokerService } from './broker/binance.broker.service';

/**
 * Binance Module
 *
 * @author Yepeng Ding
 */
@Module({
  providers: [BinanceBrokerService],
})
export class BinanceModule {}

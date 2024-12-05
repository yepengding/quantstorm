import { Module } from '@nestjs/common';
import { BitgetController } from './bitget.controller';
import { StrategyModule } from '../strategy/strategy.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrategyState } from '../strategy/strategy.dao';
import { BitgetPerpService } from './perp/bitget.perp.service';
import { BitgetPerpBrokerService } from './perp/broker/bitget.perp.broker.service';

/**
 * Bitget Module
 *
 * @author Yepeng Ding
 */
@Module({
  imports: [TypeOrmModule.forFeature([StrategyState]), StrategyModule],
  controllers: [BitgetController],
  providers: [BitgetPerpService, BitgetPerpBrokerService],
})
export class BitgetModule {}

import { Module } from '@nestjs/common';
import { registry } from './strategy.registry';

/**
 * Strategy Module
 * @author Yepeng Ding
 */
@Module({
  providers: [{ provide: 'STRATEGY_REGISTRY', useValue: registry }],
  exports: [{ provide: 'STRATEGY_REGISTRY', useValue: registry }],
})
export class StrategyModule {}

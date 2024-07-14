import { Module } from '@nestjs/common';
import { StrategyRegistryService } from './strategy.registry.service';

@Module({
  providers: [StrategyRegistryService],
  exports: [StrategyRegistryService],
})
export class StrategyModule {}

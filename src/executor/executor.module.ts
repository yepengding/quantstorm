import { Module } from '@nestjs/common';
import { ExecutorController } from './executor.controller';
import { ExecutorService } from './executor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrategyState } from './executor.dao';
import { StrategyModule } from '../strategy/strategy.module';

@Module({
  imports: [TypeOrmModule.forFeature([StrategyState]), StrategyModule],
  controllers: [ExecutorController],
  providers: [ExecutorService],
})
export class ExecutorModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutorController } from './executor.controller';
import { StrategyModule } from '../strategy/strategy.module';
import { ExecutorService } from './executor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StrategyState } from '../strategy/strategy.dao';
import { repositoryMockFactory } from '../core/testing/mock/factories/repository';
import { ScheduleModule } from '@nestjs/schedule';
import { execSync } from 'node:child_process';

describe('ExecutorController', () => {
  let controller: ExecutorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot(), StrategyModule],
      controllers: [ExecutorController],
      providers: [
        ExecutorService,
        {
          provide: getRepositoryToken(StrategyState),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<ExecutorController>(ExecutorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should execute Demo strategy', () => {
    const command = `curl -G --data-urlencode 'args={"base":"BTC","quote":"USDT","size":1,"interval":"30m"}' http://localhost:3000/executor/execute/Demo/demo`;
    const result = execSync(command).toString('utf8');
    console.log(result);
  });
  it('should stop Demo strategy', () => {
    const command = `curl http://localhost:3000/executor/stop/demo`;
    const result = execSync(command).toString('utf8');
    console.log(result);
  });
});

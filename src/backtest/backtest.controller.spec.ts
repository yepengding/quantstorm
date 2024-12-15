import { Test, TestingModule } from '@nestjs/testing';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { StrategyModule } from '../strategy/strategy.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';
import { HttpModule } from '@nestjs/axios';
import { StrategyState } from '../strategy/strategy.dao';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../core/testing/mock/factories/repository';
import { execSync } from 'node:child_process';

describe('BacktestController', () => {
  let controller: BacktestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacktestController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        HttpModule,
        StrategyModule,
      ],
      providers: [
        BacktestService,
        {
          provide: getRepositoryToken(StrategyState),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = await module.resolve<BacktestController>(BacktestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should backtest the demo strategy', async () => {
    await controller.backtestStrategy(
      'Demo',
      1722427200,
      1722454200,
      '15m',
      'BTC',
      'USDT',
      JSON.stringify({
        base: 'BTC',
        quote: 'USDT',
        size: 1,
        interval: '30m',
      }),
    );
  });
  it('should backtest the demo strategy via curl', () => {
    const command = `curl --location --globoff 'http://localhost:3000/backtest/strategy/Demo?start=1722427200&end=1722454200&interval=15m&base=BTC&quote=USDT&args={"base":"BTC","quote":"USDT","size":1,"interval":"30m"}'`;
    const result = execSync(command).toString('utf8');
    console.log(result);
  });
});

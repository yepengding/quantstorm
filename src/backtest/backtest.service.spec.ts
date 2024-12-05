import { Test, TestingModule } from '@nestjs/testing';
import { BacktestService } from './backtest.service';
import { Demo } from '../strategy/demo/demo';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';
import { HttpModule } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { StrategyState } from '../strategy/strategy.dao';
import { getRepositoryToken } from '@nestjs/typeorm';
import { toInstance } from '../core/testing/mock/mock.utils';
import { MockType } from '../core/testing/mock/mock.types';
import { repositoryMockFactory } from '../core/testing/mock/factories/repository';

describe('BacktestService', () => {
  let service: BacktestService;
  let broker: BacktestBrokerService;
  let stateRepositoryMock: MockType<Repository<StrategyState>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] }), HttpModule],
      providers: [
        BacktestService,
        BacktestBrokerService,
        BacktestFeederService,
        {
          provide: getRepositoryToken(StrategyState),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<BacktestService>(BacktestService);
    broker = await module.resolve<BacktestBrokerService>(BacktestBrokerService);
    stateRepositoryMock = module.get(getRepositoryToken(StrategyState));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(broker).toBeDefined();
  });
  it('should run the demo strategy', async () => {
    await service.run(
      new Demo(
        'Demo',
        broker,
        toInstance<Repository<StrategyState>>(stateRepositoryMock),
      ),
      JSON.stringify({
        base: 'BTC',
        quote: 'USDT',
        size: 1,
        interval: '30m',
      }),
      1722427200,
      1722454200,
      '15m',
    );
  });
});

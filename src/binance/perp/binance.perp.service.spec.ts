import { Test, TestingModule } from '@nestjs/testing';
import { BinancePerpService } from './binance.perp.service';
import { BinancePerpBrokerService } from './broker/binance.perp.broker.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { StrategyState } from '../../strategy/strategy.dao';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../core/config';
import { MockType } from '../../core/testing/mock/mock.types';
import { repositoryMockFactory } from '../../core/testing/mock/factories/repository';

describe('BinanceService', () => {
  let service: BinancePerpService;
  let stateRepositoryMock: MockType<Repository<StrategyState>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        ScheduleModule.forRoot(),
      ],
      providers: [
        BinancePerpService,
        BinancePerpBrokerService,
        {
          provide: getRepositoryToken(StrategyState),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<BinancePerpService>(BinancePerpService);
    stateRepositoryMock = module.get(getRepositoryToken(StrategyState));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(stateRepositoryMock).toBeDefined();
  });
});

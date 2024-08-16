import { Test, TestingModule } from '@nestjs/testing';
import { BinancePerpService } from './binance.perp.service';
import { BinancePerpBrokerService } from './broker/binance.perp.broker.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { StrategyState } from '../../strategy/strategy.dao';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../core/config';

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
  });
});

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
  }),
);

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<NonNullable<unknown>>;
};

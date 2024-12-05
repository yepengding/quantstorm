import { Test, TestingModule } from '@nestjs/testing';
import { BacktestService } from './backtest.service';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';
import { Currency } from '../core/constants';
import { HttpModule } from '@nestjs/axios';
import { BacktestResult } from './structures/result';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StrategyState } from '../strategy/strategy.dao';
import { Repository } from 'typeorm';
import { repositoryMockFactory } from '../core/testing/mock/factories/repository';
import { MockType } from '../core/testing/mock/mock.types';
import { NeutralGrid } from '../strategy/neutral_grid/neutral_grid';
import { GridConfigArg } from '../strategy/neutral_grid/grid/types';

describe('BacktestNeutralGrid', () => {
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

  const params = {
    start: 1730559600,
    end: 1731164400,
  };
  it(
    'should run neutral grid strategy',
    async () => {
      const strategy = new NeutralGrid(
        'NeutralGrid',
        broker,
        stateRepositoryMock as unknown as Repository<StrategyState>,
      );
      const result = await service.run(
        strategy,
        JSON.stringify({
          base: 'BTC',
          quote: 'USDC',
          lower: 67000,
          upper: 78600,
          number: 28,
          size: 0.0137,
        } as GridConfigArg),
        params.start,
        params.end,
        '1m',
      );
      showResults(result);
    },
    180 * 1000,
  );

  function showResults(result: BacktestResult) {
    console.log(
      'Resulted balance:',
      result.getBalanceRecords(Currency.USDC).at(-1).balance,
    );
    console.log('Balance range:', result.getBalanceRange(Currency.USDC));
    console.log('Max drawdown:', result.getMaxDrawdown(Currency.USDC));
  }
});

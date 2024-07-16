import { Test, TestingModule } from '@nestjs/testing';
import { BacktestService } from './backtest.service';
import { Demo } from '../strategy/demo/demo';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestDataService } from './data/backtest.data.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';

describe('BacktestService', () => {
  let service: BacktestService;
  let broker: BacktestBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // this is being super extra, in the case that you need multiple keys with the `get` method
              if (key === 'backtest.dataPath') {
                return path.join(
                  __dirname,
                  '../../data_example/BTCUSDT-30m-2024-07-13.csv',
                );
              }
              return null;
            }),
          },
        },
        BacktestService,
        BacktestBrokerService,
        BacktestDataService,
      ],
    }).compile();

    service = module.get<BacktestService>(BacktestService);
    broker = module.get<BacktestBrokerService>(BacktestBrokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(broker).toBeDefined();
  });
  it('should run strategy', async () => {
    await service.run(new Demo(broker), 1720828800000);
  });
});

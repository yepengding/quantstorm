import { Test, TestingModule } from '@nestjs/testing';
import { BacktestDataService } from './backtest.feeder.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';

describe('BacktestDataService', () => {
  let service: BacktestDataService;

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
                  '../../../data_example/BTCUSDT-30m-2024-07-13.csv',
                );
              }
              return null;
            }),
          },
        },
        BacktestDataService,
      ],
    }).compile();

    service = module.get<BacktestDataService>(BacktestDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

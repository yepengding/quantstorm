import { Test, TestingModule } from '@nestjs/testing';
import { BacktestFeederService } from './backtest.feeder.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import { Pair } from '../../core/structures/pair';

describe('BacktestFeederService', () => {
  let service: BacktestFeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // this is being super extra, in the case that you need multiple keys with the `get` method
              if (key === 'backtest.dataPath') {
                return path.join(__dirname, '../../../data_example');
              } else if (key === 'backtest.dataCacheSize') {
                return 32768;
              }
              return null;
            }),
          },
        },
        BacktestFeederService,
      ],
    }).compile();

    service = module.get<BacktestFeederService>(BacktestFeederService);
  });

  it('should get Binance K-lines from local data', async () => {
    const kLines = await service.getBinanceKLines(
      new Pair('BTC', 'USDT'),
      '15m',
      1720836000,
    );
    expect(kLines.length).toEqual(8);
  });
});

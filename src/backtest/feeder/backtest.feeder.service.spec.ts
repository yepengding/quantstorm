import { Test, TestingModule } from '@nestjs/testing';
import { BacktestFeederService } from './backtest.feeder.service';
import { ConfigModule } from '@nestjs/config';
import { BasePair } from '../../core/structures/pair';
import { HttpModule } from '@nestjs/axios';
import configuration from '../../core/config';

describe('BacktestFeederService', () => {
  let service: BacktestFeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] }), HttpModule],
      providers: [BacktestFeederService],
    }).compile();

    service = await module.resolve<BacktestFeederService>(
      BacktestFeederService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build Binance K-line data set', async () => {
    await service.buildBinanceKLineData(
      new BasePair('BTC', 'USDT'),
      '15m',
      '2024-07-31',
      '2024-08-01',
    );
  });

  it('should get Binance K-lines from local data', async () => {
    const kLines = await service.getBinanceKLines(
      new BasePair('BTC', 'USDT'),
      '15m',
      1722389400,
    );
    expect(kLines.length).toEqual(6);
  });

  it('should download K-lines from Binance', async () => {
    await service.downloadBinanceKLines(new BasePair('BTC', 'USDT'), '15m', [
      '2024-07-30',
      '2024-08-01',
    ]);
  });
});

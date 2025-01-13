import { Test, TestingModule } from '@nestjs/testing';
import { BacktestFeederService } from './backtest.feeder.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BasePair } from '../../core/structures/pair';
import configuration from '../../core/config';
import { FeederConfig } from '../../broker/backtest/backtest.broker.interface';
import { TimeOut } from '../../core/testing/utils';

describe('BacktestFeederService', () => {
  let envService: ConfigService;

  let service: BacktestFeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
    }).compile();

    envService = module.get<ConfigService>(ConfigService);

    service = new BacktestFeederService(
      envService.get<FeederConfig>('backtest.feeder'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it(
    'should build Binance K-line data set',
    async () => {
      await service.buildBinanceKLineData(
        new BasePair('ETH', 'USDT'),
        '1m',
        '2024-11-20',
        '2024-12-23',
      );
    },
    TimeOut.ONE_MINUTE,
  );

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

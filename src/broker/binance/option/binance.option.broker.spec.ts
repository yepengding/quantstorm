import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../core/config';
import { Logger } from '@nestjs/common';
import { BinanceConfig } from '../binance.interface';
import { BinanceOptionBrokerService } from './binance.option.broker.service';
import { OptionPair } from '../../../core/structures/pair';

describe('BinanceOptionBrokerService', () => {
  let envService: ConfigService;
  let service: BinanceOptionBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
    }).compile();

    envService = module.get<ConfigService>(ConfigService);
    service = new BinanceOptionBrokerService(
      envService.get<BinanceConfig>('binance'),
      new Logger(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should fetch all greeks', async () => {
    const allGreeks = await service.getAllGreeks();
    console.log(allGreeks);
  });
  it('should fetch a greeks', async () => {
    const greeks = await service.getGreeks(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    console.log(greeks);
  });
  it('should get market price', async () => {
    const price = await service.getMarketPrice(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    console.log(price);
  });
  it('should get best bid and ask', async () => {
    const bestBid = await service.getBestBid(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    const bestAsk = await service.getBestAsk(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    console.log(bestBid, bestAsk);
  });
  it('should get K-lines', async () => {
    const kLines = await service.getKLines(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
      '30m',
      100,
    );
    expect(kLines.length).toBe(100);
  });
});

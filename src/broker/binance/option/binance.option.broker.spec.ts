import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../core/config';
import { Logger } from '@nestjs/common';
import { BinanceConfig } from '../binance.interface';
import { BinanceOptionBrokerService } from './binance.option.broker.service';
import { Currency, OptionPair } from '../../../core/structures/pair';

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
  it('should place a limit buy order', async () => {
    const order = await service.placeLimitBuy(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
      0.01,
      1,
    );
    console.log(order);
  });
  it('should place a limit sell order', async () => {
    const order = await service.placeLimitSell(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
      0.01,
      100,
    );
    console.log(order);
  });
  it('should cancel an order', async () => {
    const isCancelled = await service.cancelOrder(
      '',
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    console.log(isCancelled);
  });
  it('should get all greeks', async () => {
    const allGreeks = await service.getAllGreeks();
    console.log(allGreeks);
  });
  it('should get a greeks', async () => {
    const greeks = await service.getGreeks(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    console.log(greeks);
  });
  it('should get user exercise price', async () => {
    const exercisePrice = await service.getExercisePrice(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    console.log(exercisePrice);
  });
  it('should get balance', async () => {
    const balance = await service.getBalance(Currency.USDT);
    console.log(balance);
  });
  it('should get an order', async () => {
    const order = await service.getOrder('', OptionPair.fromSymbol(''));
    console.log(order);
  });
  it('should get orders', async () => {
    const orders = await service.getOrders(OptionPair.fromSymbol(''));
    console.log(orders);
  });
  it('should get open orders', async () => {
    const orders = await service.getOpenOrders(
      OptionPair.fromSymbol('BTC/USDT:USDT-260327-100000-C'),
    );
    console.log(orders);
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

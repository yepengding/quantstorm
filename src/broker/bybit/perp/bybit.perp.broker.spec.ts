import { Test, TestingModule } from '@nestjs/testing';
import { BybitPerpBrokerService } from './bybit.perp.broker.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../core/config';
import { Currency } from '../../../core/constants';
import { PerpetualPair } from '../../../core/structures/pair';
import { Logger } from '@nestjs/common';
import { BybitConfig } from '../bybit.interface';

describe('BybitPerpBrokerService', () => {
  let envService: ConfigService;
  let service: BybitPerpBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
    }).compile();

    envService = module.get<ConfigService>(ConfigService);
    service = new BybitPerpBrokerService(
      envService.get<BybitConfig>('bybit'),
      new Logger(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should place a limit (post-only) long order', async () => {
    const order = await service.placeGTXLong(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
      3000,
    );
    console.log(order);
  });
  it('should place a limit (post-only) short order', async () => {
    const order = await service.placeGTXShort(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a limit long order', async () => {
    const order = await service.placeLimitLong(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
      3000,
    );
    console.log(order);
  });
  it('should place a limit short order', async () => {
    const order = await service.placeLimitShort(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a market long order', async () => {
    const order = await service.placeMarketLong(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
    );
    console.log(order);
  });
  it('should place a market short order', async () => {
    const order = await service.placeMarketShort(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
    );
    console.log(order);
  });
  it('should place a stop market long order', async () => {
    const order = await service.placeStopMarketLong(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a stop market short order', async () => {
    const order = await service.placeStopMarketShort(
      new PerpetualPair('ETH', 'USDT'),
      0.01,
      3100,
    );
    console.log(order);
  });
  it('should get an order', async () => {
    const order = await service.getOrder('', new PerpetualPair('ETH', 'USDT'));
    console.log(order);
  });
  it('should cancel an order', async () => {
    const isCancelled = await service.cancelOrder(
      '791eba36-ced9-4d98-976a-e8aef6874f63',
      new PerpetualPair('ETH', 'USDC'),
    );
    console.log(isCancelled);
  });
  it('should cancel multiple orders', async () => {
    const isCancelled = await service.cancelOrders(
      [''],
      new PerpetualPair('ETH', 'USDT'),
    );
    console.log(isCancelled);
  });
  it('should get position', async () => {
    const position = await service.getPosition(
      new PerpetualPair('ETH', 'USDT'),
    );
    console.log(position);
  });
  it('should get best bid and ask', async () => {
    const bestBid = await service.getBestBid(new PerpetualPair('ETH', 'USDT'));
    const bestAsk = await service.getBestAsk(new PerpetualPair('ETH', 'USDT'));
    console.log(bestBid, bestAsk);
  });
  it('should get balance', async () => {
    const balance = await service.getBalance(Currency.USDT);
    console.log(balance);
  });
  it('should get an order by id', async () => {
    const order = await service.getOrder('', new PerpetualPair('ETH', 'USDT'));
    console.log(order);
  });
  it('should get orders', async () => {
    const orders = await service.getOrders(new PerpetualPair('ETH', 'USDT'));
    console.log(orders);
  });
  it('should get open orders', async () => {
    const orders = await service.getOpenOrders(
      new PerpetualPair('ETH', 'USDT'),
    );
    console.log(orders);
  });
  it('should get market price', async () => {
    const price = await service.getMarketPrice(
      new PerpetualPair('ETH', 'USDT'),
    );
    console.log(price);
  });
  it('should get K-lines', async () => {
    const kLines = await service.getKLines(
      new PerpetualPair('ETH', 'USDT'),
      '30m',
      100,
    );
    console.log(kLines);
    expect(kLines.length).toBe(100);
  });
});

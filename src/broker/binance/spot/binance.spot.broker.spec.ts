import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../core/config';
import { BasePair, Currency } from '../../../core/structures/pair';
import { Logger } from '@nestjs/common';
import { BinanceConfig } from '../binance.interface';
import { BinanceSpotBrokerService } from './binance.spot.broker.service';

describe('BinanceSpotBrokerService', () => {
  let envService: ConfigService;
  let service: BinanceSpotBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
    }).compile();

    envService = module.get<ConfigService>(ConfigService);
    service = new BinanceSpotBrokerService(
      envService.get<BinanceConfig>('binance'),
      new Logger(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should place a limit (post-only) buy order', async () => {
    const order = await service.placeGTXBuy(
      new BasePair('ETH', 'USDC'),
      0.01,
      3000,
    );
    console.log(order);
  });
  it('should place a limit (post-only) sell order', async () => {
    const order = await service.placeGTXSell(
      new BasePair('ETH', 'USDC'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a limit buy order', async () => {
    const order = await service.placeLimitBuy(
      new BasePair('ETH', 'USDC'),
      0.01,
      3000,
    );
    console.log(order);
  });
  it('should place a limit sell order', async () => {
    const order = await service.placeLimitSell(
      new BasePair('ETH', 'USDC'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a stop market buy order', async () => {
    const order = await service.placeStopMarketBuy(
      new BasePair('ETH', 'USDC'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a stop market sell order', async () => {
    const order = await service.placeStopMarketSell(
      new BasePair('ETH', 'USDC'),
      0.01,
      3300,
    );
    console.log(order);
  });
  it('should get an order', async () => {
    const order = await service.getOrder('', new BasePair('ETH', 'USDC'));
    console.log(order);
  });
  it('should cancel an order', async () => {
    const isCancelled = await service.cancelOrder(
      '',
      new BasePair('ETH', 'USDC'),
    );
    console.log(isCancelled);
  });
  it('should cancel a conditional order', async () => {
    const isCancelled = await service.cancelConditionalOrder(
      '',
      new BasePair('ETH', 'USDC'),
    );
    console.log(isCancelled);
  });
  it('should cancel multiple orders', async () => {
    const isCancelled = await service.cancelOrders(
      [],
      new BasePair('ETH', 'USDC'),
    );
    console.log(isCancelled);
  });
  it('should cancel multiple conditional orders', async () => {
    const isCancelled = await service.cancelConditionalOrders(
      [''],
      new BasePair('ETH', 'USDC'),
    );
    console.log(isCancelled);
  });
  it('should subscribe RWUSD', () => {
    service.subscribeRWUSD(10);
  });
  it('should redeem RWUSD', () => {
    service.redeemRWUSD(10, 'FAST');
  });
  it('should get best bid and ask', async () => {
    const bestBid = await service.getBestBid(new BasePair('ETH', 'USDC'));
    const bestAsk = await service.getBestAsk(new BasePair('ETH', 'USDC'));
    console.log(bestBid, bestAsk);
  });
  it('should get balance', async () => {
    const balance = await service.getBalance(Currency.USDC);
    console.log(balance);
  });
  it('should get an order by id', async () => {
    const order = await service.getOrder('', new BasePair('ETH', 'USDC'));
    console.log(order);
  });
  it('should get orders', async () => {
    const orders = await service.getOrders(new BasePair('ETH', 'USDC'));
    console.log(orders);
  });
  it('should get open orders', async () => {
    const orders = await service.getOpenOrders(new BasePair('ETH', 'USDC'));
    console.log(orders);
  });
  it('should get open conditional orders', async () => {
    const orders = await service.getOpenConditionalOrders(
      new BasePair('ETH', 'USDC'),
    );
    console.log(orders);
  });
  it('should get market price', async () => {
    const price = await service.getMarketPrice(new BasePair('ETH', 'USDC'));
    console.log(price);
  });
  it('should get K-lines', async () => {
    const kLines = await service.getKLines(
      new BasePair('ETH', 'USDC'),
      '30m',
      100,
    );
    expect(kLines.length).toBe(100);
  });
  it('should get simple earn flexible balance', async () => {
    const balance = await service.getSimpleEarnFlexibleBalance(Currency.BTC);
    console.log(balance);
  });
});

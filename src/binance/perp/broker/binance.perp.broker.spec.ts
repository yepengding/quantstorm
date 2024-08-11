import { Test, TestingModule } from '@nestjs/testing';
import { BinancePerpBrokerService } from './binance.perp.broker.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../../core/config';
import { Currency } from '../../../core/constants';
import { PerpetualPair } from '../../../core/structures/pair';

describe('BinancePerpBrokerService', () => {
  let service: BinancePerpBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [BinancePerpBrokerService],
    }).compile();

    service = module.get<BinancePerpBrokerService>(BinancePerpBrokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should place a limit (post-only) long order', async () => {
    const order = await service.placeGTXLong(
      new PerpetualPair('ETH', 'USDC'),
      0.01,
      3000,
    );
    console.log(order);
  });
  it('should place a limit (post-only) short order', async () => {
    const order = await service.placeGTXShort(
      new PerpetualPair('ETH', 'USDC'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a limit long order', async () => {
    const order = await service.placeLimitLong(
      new PerpetualPair('ETH', 'USDC'),
      0.01,
      3000,
    );
    console.log(order);
  });
  it('should place a limit short order', async () => {
    const order = await service.placeLimitShort(
      new PerpetualPair('ETH', 'USDC'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a stop market long order', async () => {
    const order = await service.placeStopMarketLong(
      new PerpetualPair('ETH', 'USDC'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should place a stop market short order', async () => {
    const order = await service.placeStopMarketShort(
      new PerpetualPair('ETH', 'USDC'),
      0.01,
      3300,
    );
    console.log(order);
  });
  it('should get an order', async () => {
    const order = await service.getOrder('', new PerpetualPair('ETH', 'USDC'));
    console.log(order);
  });
  it('should cancel an order', async () => {
    const isCancelled = await service.cancelOrder(
      '',
      new PerpetualPair('ETH', 'USDC'),
    );
    console.log(isCancelled);
  });
  it('should get position', async () => {
    const position = await service.getPosition(
      new PerpetualPair('ETH', 'USDC'),
    );
    console.log(position);
  });
  it('should get best bid and ask', async () => {
    const bestBid = await service.getBestBid(new PerpetualPair('ETH', 'USDC'));
    const bestAsk = await service.getBestAsk(new PerpetualPair('ETH', 'USDC'));
    console.log(bestBid, bestAsk);
  });
  it('should get balance', async () => {
    const balance = await service.getBalance(Currency.USDC);
    console.log(balance);
  });
  it('should get an order by id', async () => {
    const order = await service.getOrder('', new PerpetualPair('ETH', 'USDC'));
    console.log(order);
  });
  it('should get orders', async () => {
    const orders = await service.getOrders(new PerpetualPair('ETH', 'USDC'));
    console.log(orders);
  });
});

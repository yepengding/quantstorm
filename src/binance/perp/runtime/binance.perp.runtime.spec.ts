import { Test, TestingModule } from '@nestjs/testing';
import { BinancePerpBrokerService } from '../broker/binance.perp.broker.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../../core/config';
import { PerpetualPair } from '../../../core/structures/pair';
import { TradeSide } from '../../../core/constants';

describe('BinancePerpRuntime', () => {
  let service: BinancePerpBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [BinancePerpBrokerService],
    }).compile();

    service = module.get<BinancePerpBrokerService>(BinancePerpBrokerService);
  });

  const pair = new PerpetualPair('ETH', 'USDC');

  it('should get open orders', async () => {
    const orders = await service.getOpenOrders(pair);
    console.log(orders);
  });
  it('should get position', async () => {
    const position = await service.getPosition(pair);
    console.log(position);
  });
  it('should the size of open orders equal to the position size', async () => {
    const nonConditionalOrders = (await service.getOpenOrders(pair)).filter(
      (o) => !!o.price,
    );
    const orderSize = nonConditionalOrders.reduce(
      (curr, prev) =>
        curr + (prev.side == TradeSide.LONG ? prev.size : -prev.size),
      0,
    );
    const position = await service.getPosition(pair);
    console.log(
      (!position && orderSize == 0) ||
        pair.roundSize(-orderSize) ==
          pair.roundSize(
            position.side == TradeSide.LONG ? position.size : -position.size,
          ),
    );
  });
  it('should place a limit (post-only) long order at the best bid', async () => {
    const bestBid = await service.getBestBid(pair);
    const order = await service.placeGTXLong(pair, 0.01, bestBid);
    console.log(order);
  });
  it('should place a limit (post-only) short order at the best ask', async () => {
    const bestAsk = await service.getBestAsk(pair);
    const order = await service.placeGTXShort(pair, 0.01, bestAsk);
    console.log(order);
  });
  it('should cancel an order', async () => {
    const isCancelled = await service.cancelOrder('', pair);
    console.log(isCancelled);
  });
});

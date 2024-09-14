import { Test, TestingModule } from '@nestjs/testing';
import { BinancePerpBrokerService } from '../broker/binance.perp.broker.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../../core/config';
import { PerpetualPair } from '../../../core/structures/pair';

describe('BinancePerpRuntime', () => {
  let service: BinancePerpBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [BinancePerpBrokerService],
    }).compile();

    service = module.get<BinancePerpBrokerService>(BinancePerpBrokerService);
  });

  it('should get open orders', async () => {
    const orders = await service.getOpenOrders(
      new PerpetualPair('ETH', 'USDC'),
    );
    console.log(orders);
  });
  it('should get position', async () => {
    const position = await service.getPosition(
      new PerpetualPair('ETH', 'USDC'),
    );
    console.log(position);
  });
  it('should cancel an order', async () => {
    const isCancelled = await service.cancelOrder(
      '',
      new PerpetualPair('ETH', 'USDC'),
    );
    console.log(isCancelled);
  });
});

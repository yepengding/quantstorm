import { Test, TestingModule } from '@nestjs/testing';
import { BinanceBrokerService } from './binance.broker.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../core/config';
import { Pair } from '../../core/structures/pair';

describe('BinanceBrokerService', () => {
  let service: BinanceBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [BinanceBrokerService],
    }).compile();

    service = module.get<BinanceBrokerService>(BinanceBrokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should place a limit long order', async () => {
    const order = await service.placeLimitLong(
      new Pair('ETH', 'USDC'),
      0.01,
      3000,
    );
    console.log(order);
  });
  it('should place a limit short order', async () => {
    const order = await service.placeLimitShort(
      new Pair('ETH', 'USDC'),
      0.01,
      3500,
    );
    console.log(order);
  });
  it('should cancel an order', async () => {
    const isCancelled = await service.cancelOrder('', new Pair('ETH', 'USDC'));
    console.log(isCancelled);
  });
  it('should get position', async () => {
    const position = await service.getPosition(new Pair('ETH', 'USDC'));
    console.log(position);
  });

  it('should get balance', async () => {
    const balance = await service.getBalance('USDC');
    console.log(balance);
  });
});

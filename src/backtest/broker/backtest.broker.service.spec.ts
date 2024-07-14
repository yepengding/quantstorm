import { Test, TestingModule } from '@nestjs/testing';
import { BacktestBrokerService } from './backtest.broker.service';

describe('BacktestBrokerService', () => {
  let service: BacktestBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BacktestBrokerService],
    }).compile();

    service = module.get<BacktestBrokerService>(BacktestBrokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { BacktestService } from './backtest.service';

describe('BacktestService', () => {
  let service: BacktestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BacktestService],
    }).compile();

    service = module.get<BacktestService>(BacktestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

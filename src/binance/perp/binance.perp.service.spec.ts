import { Test, TestingModule } from '@nestjs/testing';
import { BinancePerpService } from './binance.perp.service';

describe('BinanceService', () => {
  let service: BinancePerpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinancePerpService],
    }).compile();

    service = module.get<BinancePerpService>(BinancePerpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

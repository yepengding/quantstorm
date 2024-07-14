import { Test, TestingModule } from '@nestjs/testing';
import { StrategyRegistryService } from './strategy.registry.service';

describe('StrategyRegistryService', () => {
  let service: StrategyRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrategyRegistryService],
    }).compile();

    service = module.get<StrategyRegistryService>(StrategyRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

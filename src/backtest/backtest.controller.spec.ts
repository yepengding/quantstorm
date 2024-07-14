import { Test, TestingModule } from '@nestjs/testing';
import { BacktestController } from './backtest.controller';

describe('BacktestController', () => {
  let controller: BacktestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacktestController],
    }).compile();

    controller = module.get<BacktestController>(BacktestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

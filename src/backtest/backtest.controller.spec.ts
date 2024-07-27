import { Test, TestingModule } from '@nestjs/testing';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { StrategyModule } from '../strategy/strategy.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';

describe('BacktestController', () => {
  let controller: BacktestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacktestController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        StrategyModule,
      ],
      providers: [
        BacktestService,
        BacktestBrokerService,
        BacktestFeederService,
      ],
    }).compile();

    controller = module.get<BacktestController>(BacktestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should backtest the demo strategy', async () => {
    await controller.index('Demo', 1720843200, 1720913400, '15m');
  });
});

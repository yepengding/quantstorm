import { Test, TestingModule } from '@nestjs/testing';
import { BacktestService } from './backtest.service';
import { Demo } from '../strategy/demo/demo';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';

describe('BacktestService', () => {
  let service: BacktestService;
  let broker: BacktestBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [
        BacktestService,
        BacktestBrokerService,
        BacktestFeederService,
      ],
    }).compile();

    service = module.get<BacktestService>(BacktestService);
    broker = module.get<BacktestBrokerService>(BacktestBrokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(broker).toBeDefined();
  });
  it('should run the demo strategy', async () => {
    await service.run(new Demo(broker), 1720843200, 1720913400, '15m');
  });
});

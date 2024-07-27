import { Test, TestingModule } from '@nestjs/testing';
import { BacktestService } from './backtest.service';
import { Demo } from '../strategy/demo/demo';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestDataService } from './data/backtest.data.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';
import { ZoneRecovery } from '../strategy/zone_recovery/zone_recovery';

describe('BacktestService', () => {
  let service: BacktestService;
  let broker: BacktestBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [BacktestService, BacktestBrokerService, BacktestDataService],
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
  it(
    'should run the zone recovery strategy',
    async () => {
      await service.run(new ZoneRecovery(broker), 1720310460, 1720915140, '1m');
    },
    60 * 1000,
  );
});

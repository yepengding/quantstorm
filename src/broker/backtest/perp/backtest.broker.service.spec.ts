import { Test, TestingModule } from '@nestjs/testing';
import { BacktestPerpBrokerService } from './backtest.perp.broker.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../core/config';
import { HttpModule } from '@nestjs/axios';
import { BacktestConfig } from '../backtest.interface';

describe('BacktestPerpBrokerService', () => {
  let envService: ConfigService;
  let service: BacktestPerpBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] }), HttpModule],
    }).compile();
    envService = module.get<ConfigService>(ConfigService);
    service = new BacktestPerpBrokerService(
      envService.get<BacktestConfig>('backtest'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

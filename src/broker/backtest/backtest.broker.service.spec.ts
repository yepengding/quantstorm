import { Test, TestingModule } from '@nestjs/testing';
import { BacktestBrokerService } from './backtest.broker.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../core/config';
import { HttpModule } from '@nestjs/axios';
import { BacktestConfig } from './backtest.broker.interface';

describe('BacktestBrokerService', () => {
  let envService: ConfigService;
  let service: BacktestBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] }), HttpModule],
    }).compile();
    envService = module.get<ConfigService>(ConfigService);
    service = new BacktestBrokerService(
      envService.get<BacktestConfig>('backtest'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { BacktestBrokerService } from './broker/backtest.broker.service';
import { BacktestFeederService } from './feeder/backtest.feeder.service';
import { StrategyModule } from '../strategy/strategy.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';
import { HttpModule } from '@nestjs/axios';

describe('BacktestController', () => {
  let controller: BacktestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacktestController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        HttpModule,
        StrategyModule,
      ],
      providers: [
        BacktestService,
        BacktestBrokerService,
        BacktestFeederService,
      ],
    }).compile();

    controller = await module.resolve<BacktestController>(BacktestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should backtest the demo strategy', async () => {
    await controller.backtestStrategy(
      'Demo',
      1722427200,
      1722454200,
      '15m',
      'BTC',
      'USDT',
      JSON.stringify({
        base: 'BTC',
        quote: 'USDT',
        size: 1,
        interval: '30m',
      }),
    );
  });
});

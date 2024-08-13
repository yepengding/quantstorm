import { Test, TestingModule } from '@nestjs/testing';
import { BinanceController } from './binance.controller';
import { execSync } from 'node:child_process';
import { BinancePerpService } from './perp/binance.perp.service';
import { StrategyModule } from '../strategy/strategy.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BinancePerpBrokerService } from './perp/broker/binance.perp.broker.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../core/config';

describe('BinanceController', () => {
  let controller: BinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        ScheduleModule.forRoot(),
        StrategyModule,
      ],
      controllers: [BinanceController],
      providers: [BinancePerpBrokerService, BinancePerpService],
    }).compile();

    controller = module.get<BinanceController>(BinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should execute Demo strategy', () => {
    const command = `curl -G --data-urlencode 'args={"base":"BTC","quote":"USDT","size":1,"interval":"30m"}' http://localhost:3000/binance/perp/execute/Demo`;
    const result = execSync(command).toString('utf8');
    console.log(result);
  });
  it('should stop Demo strategy', () => {
    const command = `curl http://localhost:3000/binance/perp/stop/Demo`;
    const result = execSync(command).toString('utf8');
    console.log(result);
  });
});

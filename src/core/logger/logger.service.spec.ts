import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should log debug', () => {
    service.debug('testing logger service', 'Test');
  });
});

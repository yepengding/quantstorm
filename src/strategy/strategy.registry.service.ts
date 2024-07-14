import { Injectable } from '@nestjs/common';
import { Demo } from './demo/demo';
import { Broker } from '../core/model';
import { StrategyAbstract } from './strategy.abstract';

@Injectable()
export class StrategyRegistryService {
  private readonly registry: Map<
    string,
    { new (broker: Broker): StrategyAbstract }
  >;

  constructor() {
    this.registry = new Map([['Demo', Demo]]);
  }

  public getStrategy(name: string): { new (broker: Broker): StrategyAbstract } {
    return this.registry.get(name);
  }
}

import { Injectable } from '@nestjs/common';
import { Broker, Order } from '../core/model';

@Injectable()
export class BacktestBrokerService implements Broker {
  placeMarketLong(symbol: string, size: number): Order {
    console.log(`Long ${size} ${symbol}`);
    return undefined;
  }

  placeMarketShort(symbol: string, size: number): Order {
    console.log(`Short ${size} ${symbol}`);
    return undefined;
  }
}

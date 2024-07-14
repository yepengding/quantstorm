import { Injectable } from '@nestjs/common';
import { Broker } from '../../core/interfaces/broker.interface';
import { Order } from '../../core/interfaces/order.interface';

/**
 * Backtest Broker Service
 * @author Yepeng Ding
 */
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

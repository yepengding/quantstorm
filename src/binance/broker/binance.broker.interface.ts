import { Broker } from '../../core/interfaces/broker.interface';

/**
 * Binance Broker
 *
 * @author Yepeng Ding
 */
export interface BinanceBroker extends Broker {}

export interface BinanceConfig {
  apiKey: string;
  secret: string;
}

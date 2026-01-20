import { SpotBroker } from '../../../core/interfaces/broker.interface';
import { BacktestBroker } from '../backtest.interface';

/**
 * Backtest Spot Broker
 *
 * @author Yepeng Ding
 */
export interface BacktestSpotBroker extends BacktestBroker, SpotBroker {}

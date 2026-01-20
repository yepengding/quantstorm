import { PerpBroker } from '../../../core/interfaces/broker.interface';
import { BacktestBroker } from '../backtest.interface';

/**
 * Backtest Perpetual Broker
 *
 * @author Yepeng Ding
 */
export interface BacktestPerpBroker extends BacktestBroker, PerpBroker {}

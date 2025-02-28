/* eslint-disable import/no-extraneous-dependencies */
import { IMnemoUnsubscribed } from '../viewer';

export abstract class ActiveShapesAbstractClass<U, V> extends IMnemoUnsubscribed {
  public abstract getHistoryData(start: Date, end: Date): void;

  public abstract sortHistoryData(data: V): void;
}

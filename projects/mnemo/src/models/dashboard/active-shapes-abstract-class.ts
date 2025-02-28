/* eslint-disable import/no-extraneous-dependencies */
import { Subscription } from 'rxjs';
import { IMnemoSubModel } from '../mnemo/mnemo-sub.model';

export abstract class ActiveShapesAbstractClass<U, V> implements IMnemoSubModel {
  public abstract subscriptions?: Subscription[];

  public abstract initSubscribe(...args): void;

  public abstract destroy?(): void;

  public abstract getHistoryData(start: Date, end: Date): void;

  public abstract sortHistoryData(data: V): void;
}

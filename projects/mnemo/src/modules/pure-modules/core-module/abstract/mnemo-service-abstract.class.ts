/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Subscription } from 'rxjs';
import { IMnemoSubModel } from '../../../../models/mnemo/mnemo-sub.model';

export abstract class MnemoServiceAbstract implements IMnemoSubModel {
  public abstract subscriptions?: Subscription[];

  public abstract initSubscribe(...args): void;

  public abstract destroy?(): void;
}

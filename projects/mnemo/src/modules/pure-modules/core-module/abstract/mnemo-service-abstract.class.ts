/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Subscription } from 'rxjs';

export abstract class MnemoServiceAbstract {
  public abstract subscriptions?: Subscription[];

  public abstract initSubscribe(...args): void;

  public abstract destroy?(): void;
}

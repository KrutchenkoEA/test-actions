import { Subscription } from 'rxjs';

export interface IMnemoSubModel {
  subscriptions?: Subscription[];

  initSubscribe(...args): void;

  ngOnDestroy?(): void;
}

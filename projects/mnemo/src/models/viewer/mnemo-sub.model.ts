import { Subscription } from 'rxjs';

export abstract class IMnemoUnsubscribed {
  abstract subscriptions: Subscription[];

  abstract initSubs(...args): void;

  destroySubs(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}

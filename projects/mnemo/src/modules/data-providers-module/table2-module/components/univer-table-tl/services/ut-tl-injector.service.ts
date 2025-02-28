/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { IdentifierDecorator, Injector, mergeOverrideWithDependencies } from '@univerjs/core';
import { IUniverTableTlCommandService, UtTlCommandService } from './ut-tl-command.service';

@Injectable()
export class UtTlInjectorService {
  public injector: Injector;

  public init(injector: Injector): void {
    this.injector = injector;
    this.registerInjector();
  }

  public getInstanceByInjector<U>(instance: IdentifierDecorator<U>): U {
    return this.injector.get(instance);
  }

  public registerInjector(): void {
    const dependencies = mergeOverrideWithDependencies([
      [IUniverTableTlCommandService, { useClass: UtTlCommandService, lazy: true }],
    ]);

    dependencies.forEach((dependency) => this.injector.add(dependency));
  }
}

/* eslint-disable import/no-extraneous-dependencies */
import { Injector, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fn',
  pure: true,
  standalone: true,
})
export class FnPipe implements PipeTransform {
  public transform(
    templateValue: unknown,
    fnReference: (...e: unknown[]) => unknown,
    ...fnArguments: unknown[]
  ): Injector {
    return fnReference(templateValue, ...fnArguments) as Injector;
  }
}

/* eslint-disable import/no-extraneous-dependencies */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fill',
  standalone: true,
})
export class FillPipe implements PipeTransform {
  public transform(value: unknown): unknown[] {
    return new Array(value).fill(1);
  }
}

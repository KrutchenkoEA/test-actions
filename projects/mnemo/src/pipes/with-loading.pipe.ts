/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';

interface IState<T> {
  loading: boolean;
  value?: T;
  error?: any;
}

@Pipe({
  name: 'withLoading',
  standalone: true,
})
export class WithLoadingPipe implements PipeTransform {
  public transform<T>(obs: Observable<T>): Observable<IState<T>> {
    return obs.pipe(
      map((value) => ({ loading: false, value })),
      startWith({ loading: true }),
      catchError((error) => of({ loading: false, error }))
    );
  }
}

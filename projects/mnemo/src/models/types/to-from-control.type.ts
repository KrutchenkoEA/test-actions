/* eslint-disable import/no-extraneous-dependencies */
import { FormControl } from '@angular/forms';

export type ToFormControlType<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

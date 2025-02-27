/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToFormControlType } from '../../models';

@Injectable()
export class MnemoFormCreateService {
  private readonly formBuilder = inject(FormBuilder);

  public createObject<T extends Record<string, any>>(data: T | {}, object: Record<string, any>): Record<string, any> {
    if (data === null || data === undefined) return object;
    const newObject = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in object) {
      if (data?.[key] === null || data?.[key] === undefined) {
        newObject[key] = object[key];
      } else {
        newObject[key] = data[key];
      }
    }
    return newObject;
  }

  public createObjectWithType<T>(data: T | {}, object: T | {}): ToFormControlType<T> {
    return this.createObject<T>(data, object) as ToFormControlType<T>;
  }

  public createFormWithType<T>(data: T | {}, object: T | {}): FormGroup<ToFormControlType<T>> {
    return this.formBuilder.group(this.createObject<T>(data, object)) as FormGroup<ToFormControlType<T>>;
  }
}

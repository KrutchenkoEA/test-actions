/* eslint-disable import/no-extraneous-dependencies */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const ACTIVE_SHAPES_ITEM_OPTIONS = new InjectionToken<unknown>('active-shapes-options');
export const ACTIVE_SHAPES_ITEM_ID = new InjectionToken<string>('active-shapes-id');
export const ACTIVE_SHAPES_REALTIME_DATA = new InjectionToken<Observable<number[]>>('active-shapes-realtime-data');
export const ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA = new InjectionToken<Observable<Map<string, boolean>>>(
  'active-shapes-fixed-count-realtime-data'
);
export const ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA = new InjectionToken<Observable<Map<string, number>>>(
  'active-shapes-fixed-count-realtime-data'
);
export const ACTIVE_SHAPES_BASE_URL = 'mnemo-dashboard-base-url';

/* eslint-disable import/no-extraneous-dependencies */
import { FormGroup } from '@angular/forms';
import { ToFormControlType } from '../types';
import { IMnemoChartRequestOptions, IMnemoChartViewOptions } from './mnemo-chart.models';

export type MnemoChartRequestFormType = FormGroup<ToFormControlType<IMnemoChartRequestOptions>>;

export type MnemoChartViewFormType = FormGroup<ToFormControlType<IMnemoChartViewOptions>>;

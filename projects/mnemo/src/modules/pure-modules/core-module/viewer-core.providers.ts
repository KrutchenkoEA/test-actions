/* eslint-disable import/no-extraneous-dependencies */
import {
  MnemoLoggerService,
  RtdbApiService,
  RtdbFormulaApiService,
  RtdbOmApiService,
  RtdbTagApiService,
} from '../../../services';
import { TooltipTemplateService, ViewerHelperService, ViewerMapperService } from './helper-services';
import { PlayerModeService, PlayerService } from './player-services';
import {
  ViewerActiveShapesService,
  ViewerFormulaService,
  ViewerIntervalService,
  ViewerOMService,
  ViewerRefreshService,
  ViewerService,
  ViewerTagService,
} from './services';
import { ViewerCheckerService } from './services/viewer-checker.service';

export const ViewerCoreApiServices = [RtdbTagApiService, RtdbOmApiService, RtdbFormulaApiService, RtdbApiService];

export const ViewerCoreCommonServices = [
  ViewerService,
  PlayerService,
  PlayerModeService,
  ViewerIntervalService,
  ViewerRefreshService,
  TooltipTemplateService,
  ViewerHelperService,
  ViewerMapperService,
  MnemoLoggerService,
  ViewerCheckerService,
];

export const ViewerCorePrivatServices = [
  ViewerTagService,
  ViewerOMService,
  ViewerFormulaService,
  ViewerActiveShapesService,
];

export const ViewerCoreProviders = [...ViewerCorePrivatServices, ...ViewerCoreCommonServices, ViewerCoreApiServices];

/* eslint-disable import/no-extraneous-dependencies */
import {
  ActiveShapesDataCreatorService,
  ActiveShapesFormulaService,
  ActiveShapesOmService,
  ActiveShapesRawExtractorService,
  ActiveShapesRawOldService,
  ActiveShapesRawService,
  ActiveShapesRealtimeService,
  ActiveShapesService,
  ActiveShapesShapesSetsChartService,
  ActiveShapesTagService,
  ActiveShapesValueService,
  ActiveShapesWrapperService,
} from './services';

export const ActiveShapesProviders = [
  ActiveShapesService,
  ActiveShapesValueService,
  ActiveShapesRawService,
  ActiveShapesRawOldService,
  ActiveShapesTagService,
  ActiveShapesOmService,
  ActiveShapesFormulaService,
  ActiveShapesWrapperService,
  ActiveShapesRealtimeService,
];

export const ActiveShapesCommonProviders = [
  ActiveShapesDataCreatorService,
  ActiveShapesRawExtractorService,
  ActiveShapesShapesSetsChartService,
];

import { ExtendedShapesService, PureCustomShapeService } from '../mx-graph-services';
import {
  MnemoFormulaService,
  MnemoRuleService,
  MnemoGraphService,
  MnemoToolsService,
  MnemoTooltipService,
  MnemoValueApplyService,
  MnemoValueService,
  MnemoOmService,
  MnemoTagService,
} from './services';

export const MnemoProviders = [
  MnemoFormulaService,
  MnemoRuleService,
  MnemoGraphService,
  MnemoToolsService,
  MnemoTooltipService,
  MnemoValueApplyService,
  MnemoValueService,
  MnemoOmService,
  MnemoTagService,
  ExtendedShapesService,
  PureCustomShapeService,
];

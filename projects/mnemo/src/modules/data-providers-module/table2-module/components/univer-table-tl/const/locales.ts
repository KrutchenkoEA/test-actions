// eslint-disable-next-line import/no-extraneous-dependencies
import { LocaleType, merge } from '@univerjs/core';
// @ts-ignore
import DesignEnUS from '@univerjs/design/locale/en-US';
// @ts-ignore
import DesignFaIr from '@univerjs/design/locale/fa-IR';
// @ts-ignore
import DesignRuRU from '@univerjs/design/locale/ru-RU';
// @ts-ignore
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US';
// @ts-ignore
import DocsUIFaIr from '@univerjs/docs-ui/locale/fa-IR';
// @ts-ignore
import DocsUIRuRU from '@univerjs/docs-ui/locale/ru-RU';
// @ts-ignore
import FindReplaceEnUS from '@univerjs/find-replace/locale/en-US';
// @ts-ignore
import FindReplaceFaIr from '@univerjs/find-replace/locale/fa-IR';
// @ts-ignore
import FindReplaceRuRU from '@univerjs/find-replace/locale/ru-RU';
// @ts-ignore
import SheetsConditionalFormattingUIEnUS from '@univerjs/sheets-conditional-formatting-ui/locale/en-US';
// @ts-ignore
import SheetsConditionalFormattingUIFaIr from '@univerjs/sheets-conditional-formatting-ui/locale/fa-IR';
// @ts-ignore
import SheetsConditionalFormattingUIRuRU from '@univerjs/sheets-conditional-formatting-ui/locale/ru-RU';
// @ts-ignore
import SheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US';
// @ts-ignore
import SheetsCrosshairHighlightFaIr from '@univerjs/sheets-crosshair-highlight/locale/fa-IR';
// @ts-ignore
import SheetsCrosshairHighlightRuRU from '@univerjs/sheets-crosshair-highlight/locale/ru-RU';
// @ts-ignore
import SheetsDataValidationUiEnUS from '@univerjs/sheets-data-validation-ui/locale/en-US';
// @ts-ignore
import SheetsDataValidationUiFaIr from '@univerjs/sheets-data-validation-ui/locale/fa-IR';
// @ts-ignore
import SheetsDataValidationUiRuRU from '@univerjs/sheets-data-validation-ui/locale/ru-RU';
// @ts-ignore
import SheetsFilterUIEnUS from '@univerjs/sheets-filter-ui/locale/en-US';
// @ts-ignore
import SheetsFilterUIFaIr from '@univerjs/sheets-filter-ui/locale/fa-IR';
// @ts-ignore
import SheetsFilterUIRuRU from '@univerjs/sheets-filter-ui/locale/ru-RU';
// @ts-ignore
import SheetsFindReplaceEnUS from '@univerjs/sheets-find-replace/locale/en-US';
// @ts-ignore
import SheetsFindReplaceFaIr from '@univerjs/sheets-find-replace/locale/fa-IR';
// @ts-ignore
import SheetsFindReplaceRuRU from '@univerjs/sheets-find-replace/locale/ru-RU';
// @ts-ignore
import SheetsFormulaUiEnUS from '@univerjs/sheets-formula-ui/locale/en-US';
// @ts-ignore
import SheetsFormulaUiFaIr from '@univerjs/sheets-formula-ui/locale/fa-IR';
// @ts-ignore
import SheetsFormulaUiRuRU from '@univerjs/sheets-formula-ui/locale/ru-RU';
// @ts-ignore
import SheetsNumfmtEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US';
// @ts-ignore
import SheetsNumfmtFaIr from '@univerjs/sheets-numfmt-ui/locale/fa-IR';
// @ts-ignore
import SheetsNumfmtRuRU from '@univerjs/sheets-numfmt-ui/locale/ru-RU';
// @ts-ignore
import SheetsSortUIEnUS from '@univerjs/sheets-sort-ui/locale/en-US';
// @ts-ignore
import SheetsSortUIFaIr from '@univerjs/sheets-sort-ui/locale/fa-IR';
// @ts-ignore
import SheetsSortUIRuRU from '@univerjs/sheets-sort-ui/locale/ru-RU';
// @ts-ignore
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US';
// @ts-ignore
import SheetsUIFaIr from '@univerjs/sheets-ui/locale/fa-IR';
// @ts-ignore
import SheetsUIRuRU from '@univerjs/sheets-ui/locale/ru-RU';
// @ts-ignore
import SheetsEnUS from '@univerjs/sheets/locale/en-US';
// @ts-ignore
import SheetsFaIr from '@univerjs/sheets/locale/fa-IR';
// @ts-ignore
import SheetsRuRU from '@univerjs/sheets/locale/ru-RU';
// @ts-ignore
import UIEnUS from '@univerjs/ui/locale/en-US';
// @ts-ignore
import UIFaIr from '@univerjs/ui/locale/fa-IR';
// @ts-ignore
import UIRuRU from '@univerjs/ui/locale/ru-RU';

import {
  enUS as TlPluginEnUS,
  faIR as TlPluginFaIR,
  ruRU as TlPluginRuRU,
} from 'projects/shared/mnemo/modules/data-providers-module/table2-module/components/univer-table-tl/tl-plugin';

export const univerLocales = {
  [LocaleType.RU_RU]: merge(
    DesignRuRU,
    DocsUIRuRU,
    FindReplaceRuRU,
    SheetsFindReplaceRuRU,
    SheetsRuRU,
    SheetsUIRuRU,
    SheetsFormulaUiRuRU,
    SheetsDataValidationUiRuRU,
    SheetsConditionalFormattingUIRuRU,
    UIRuRU,
    SheetsFilterUIRuRU,
    SheetsNumfmtRuRU,
    SheetsSortUIRuRU,
    SheetsCrosshairHighlightEnUS,
    TlPluginRuRU
  ),
  [LocaleType.EN_US]: merge(
    DesignEnUS,
    DocsUIEnUS,
    FindReplaceEnUS,
    SheetsFindReplaceEnUS,
    SheetsEnUS,
    SheetsUIEnUS,
    SheetsFormulaUiEnUS,
    SheetsDataValidationUiEnUS,
    SheetsConditionalFormattingUIEnUS,
    UIEnUS,
    SheetsFilterUIEnUS,
    SheetsNumfmtEnUS,
    SheetsSortUIEnUS,
    SheetsCrosshairHighlightRuRU,
    TlPluginEnUS
  ),
  [LocaleType.FA_IR]: merge(
    DesignFaIr,
    DocsUIFaIr,
    FindReplaceFaIr,
    SheetsFindReplaceFaIr,
    SheetsFaIr,
    SheetsUIFaIr,
    SheetsFormulaUiFaIr,
    SheetsDataValidationUiFaIr,
    SheetsConditionalFormattingUIFaIr,
    UIFaIr,
    SheetsFilterUIFaIr,
    SheetsNumfmtFaIr,
    SheetsSortUIFaIr,
    SheetsCrosshairHighlightFaIr,
    TlPluginFaIR
  ),
};

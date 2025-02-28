/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { TRANSLOCO_SCOPE, TranslocoScope, TranslocoService } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { ColorType, CompareType, DEFAULT_STYLES, IRuleValue, PaintTargetType } from '../../../../consts';
import { IStyleObject } from '../../../../models';
import { StyleService } from '../../../../services';

type PaintTargetResTableType = 'color' | 'bgcolor' | 'border';

export interface IStyleAndValueTable {
  style: IStyleObject;
  value: number | null;
  invisible: boolean;
  blink: boolean;
}

@DecorateUntilDestroy()
@Injectable()
export class TableRuleService {
  private readonly scope = inject<TranslocoScope>(TRANSLOCO_SCOPE);
  private readonly translocoService = inject(TranslocoService);
  private readonly styleService = inject(StyleService);

  public addDefaultValueTable(
    styleObj: IStyleObject,
    rules: string
  ): {
    tagRules: string;
    tagDefStyle: object;
  } | null {
    let tagDefStyle: object | null = null;
    let isExistDefault: boolean = false;
    const tagRules = rules
      .split('~')
      .map((rule) => {
        const rulesObj = this.styleService.parseStyle(rule);
        if (
          rulesObj.ActionRule === 'Blink' ||
          rulesObj.ActionRule === 'Invisible' ||
          rulesObj.ActionRule === 'ReplaceLabel'
        ) {
          return rule;
        }

        if (rulesObj.PaintTarget === 'Shape') {
          rulesObj.PaintTarget = 'StrokeColor';
        }

        if (rulesObj[`Default${rulesObj.PaintTarget}`]) {
          isExistDefault = true;
          tagDefStyle = null;
          return rule;
        }
        const defaultKey: PaintTargetResTableType = this.getPaintTargetTable(rulesObj.PaintTarget as PaintTargetType);

        if (defaultKey) {
          if (defaultKey === 'border') {
            const objFromStyle = {
              top: [styleObj?.[defaultKey]?.top?.[0], styleObj?.[defaultKey]?.top?.[1]],
              right: [styleObj?.[defaultKey]?.right?.[0], styleObj?.[defaultKey]?.right?.[1]],
              bottom: [styleObj?.[defaultKey]?.bottom?.[0], styleObj?.[defaultKey]?.bottom?.[1]],
              left: [styleObj?.[defaultKey]?.left?.[0], styleObj?.[defaultKey]?.left?.[1]],
            };
            const objDef = {
              top: ['medium', DEFAULT_STYLES.defaultGrid],
              right: ['medium', DEFAULT_STYLES.defaultGrid],
              bottom: ['medium', DEFAULT_STYLES.defaultGrid],
              left: ['medium', DEFAULT_STYLES.defaultGrid],
            };
            const defaultColorObj = styleObj?.[defaultKey] ? objFromStyle : objDef;
            const defaultColor = JSON.stringify(defaultColorObj);
            rulesObj[`Default${rulesObj.PaintTarget}`] = defaultKey;
            rulesObj.DefaultColor = 'CustomBorders';
            rulesObj.CustomBorders = defaultColor;

            if (!styleObj[defaultKey]) {
              tagDefStyle = { ...tagDefStyle, [defaultKey]: objDef };
            } else {
              tagDefStyle = { ...tagDefStyle, [defaultKey]: objFromStyle };
            }
          } else {
            let defaultColor = DEFAULT_STYLES.fontColor;
            if (defaultKey === 'bgcolor') {
              defaultColor = DEFAULT_STYLES.defaultBgColor;
            }

            rulesObj[`Default${rulesObj.PaintTarget}`] = defaultKey;
            rulesObj.DefaultColor = styleObj?.[defaultKey] ?? defaultColor;

            if (!styleObj[defaultKey]) {
              tagDefStyle = { ...tagDefStyle, [defaultKey]: DEFAULT_STYLES.fontColor };
            } else {
              tagDefStyle = { ...tagDefStyle, [defaultKey]: styleObj[defaultKey] };
            }
          }
        }
        rulesObj[`Default${rulesObj.PaintTarget}`] = defaultKey;
        return this.styleService.combineStyle(rulesObj);
      })
      .join('~');

    return isExistDefault ? null : { tagRules, tagDefStyle };
  }

  public getStyleAndValueTable(
    value: number,
    rules: string,
    status: string,
    defaultStyle,
    styleObj: IStyleObject = null
  ): IStyleAndValueTable {
    const newRules: { [changeKey: string]: string }[] = [];
    let invisible: boolean = false;
    let blink: boolean = false;
    let newValue: number = null;

    rules.split('~').forEach((rule) => {
      const rulesObj = this.styleService.parseStyle(rule);
      const rulesValue: IRuleValue = rulesObj.CompareValue
        ? { CompareValueFrom: rulesObj.CompareValue as number, CompareValueTo: rulesObj.CompareValue as number }
        : { CompareValueFrom: rulesObj.CompareValueFrom as number, CompareValueTo: rulesObj.CompareValueTo as number };
      const resultCompare: boolean = this.checkValue(
        Number(value),
        rulesValue,
        rulesObj.CompareRule as CompareType,
        status
      );

      if (rulesObj.PaintTarget === 'Shape') {
        rulesObj.PaintTarget = 'StrokeColor';
      }

      if (rulesObj.PaintTarget !== 'Shape') {
        const name = this.getPaintTargetTable(rulesObj.PaintTarget as PaintTargetType);
        if (styleObj) {
          styleObj[name] = defaultStyle[name];
        } else {
          styleObj = { [name]: defaultStyle[name] };
        }
      }

      switch (rulesObj.ActionRule) {
        case 'Paint':
          newRules.push(this.replacePaintOptionsTable(rulesObj, resultCompare, defaultStyle));
          break;
        case 'Invisible':
          invisible = resultCompare;
          break;
        case 'Blink':
          blink = resultCompare;
          break;
        case 'ReplaceLabel':
          newValue = resultCompare ? (rulesObj.ReplaceValue as number) : null;
          break;
        default:
          break;
      }
    });

    newRules.forEach((r) => {
      if (r.resultCompare === 'true') {
        styleObj[r.name] = r[r.name];
      }
    });
    return {
      style: styleObj,
      value: newValue ?? value,
      invisible,
      blink,
    };
  }

  public getTranslate(word: string): string {
    let newWord: string = '';
    this.translocoService
      .selectTranslate(
        `ViewerHelperService.${word}`,
        {},
        (this.scope as unknown as TranslocoScope[]).find((scope) => scope === 'mnemo')
      )
      .pipe(takeUntilDestroyed(this))
      .subscribe((message: string) => {
        newWord = message;
      });
    return newWord;
  }

  private checkValue(value: number, ruleValue: IRuleValue, rule: CompareType, status?: string): boolean {
    switch (rule) {
      case 'Equal':
        return value === ruleValue.CompareValueFrom;
      case 'Greater':
        return value >= ruleValue.CompareValueFrom;
      case 'Less':
        return value <= ruleValue.CompareValueFrom;
      case 'Between':
        return value >= ruleValue.CompareValueFrom && value <= ruleValue.CompareValueTo;
      case 'Out':
        return !(value >= ruleValue.CompareValueFrom && value <= ruleValue.CompareValueTo);
      case 'Bad':
        return status === 'Bad';
      default:
        return false;
    }
  }

  private replacePaintOptionsTable(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rulesObj: any,
    resultCompare: boolean,
    defaultStyle: object
  ): { [changeKey: string]: string } {
    const name = this.getPaintTargetTable(rulesObj.PaintTarget);

    switch (rulesObj.PaintTarget) {
      case 'Shape':
      case 'Label':
      case 'StrokeColor':
      case 'FillColor': {
        let resultColor: {
          [changeKey: string]:
            | string
            | {
                top: [string, string];
                right: [string, string];
                bottom: [string, string];
                left: [string, string];
              };
        };
        if (resultCompare) {
          resultColor = this.changeColorTable(rulesObj.ColorValue, rulesObj.PaintTarget);
        } else {
          resultColor = { [name]: defaultStyle[name] };
        }
        return { ...resultColor, resultCompare: resultCompare ? 'true' : '', name };
      }
      default:
        return null;
    }
  }

  private changeColorTable(
    color: ColorType,
    key: PaintTargetType,
    borders = null
  ): {
    [changeKey: string]:
      | string
      | {
          top: [string, string];
          right: [string, string];
          bottom: [string, string];
          left: [string, string];
        };
  } {
    const changeKey: PaintTargetResTableType = this.getPaintTargetTable(key);
    if (changeKey === 'border') {
      switch (color) {
        case 'Default':
          return {
            [changeKey]: {
              top: ['medium', DEFAULT_STYLES.defaultColor],
              right: ['medium', DEFAULT_STYLES.defaultColor],
              bottom: ['medium', DEFAULT_STYLES.defaultColor],
              left: ['medium', DEFAULT_STYLES.defaultColor],
            },
          };
        case 'Success':
          return {
            [changeKey]: {
              top: ['medium', DEFAULT_STYLES.successColor],
              right: ['medium', DEFAULT_STYLES.successColor],
              bottom: ['medium', DEFAULT_STYLES.successColor],
              left: ['medium', DEFAULT_STYLES.successColor],
            },
          };
        case 'Info':
          return {
            [changeKey]: {
              top: ['medium', DEFAULT_STYLES.infoColor],
              right: ['medium', DEFAULT_STYLES.infoColor],
              bottom: ['medium', DEFAULT_STYLES.infoColor],
              left: ['medium', DEFAULT_STYLES.infoColor],
            },
          };
        case 'Warning':
          return {
            [changeKey]: {
              top: ['medium', DEFAULT_STYLES.warningColor],
              right: ['medium', DEFAULT_STYLES.warningColor],
              bottom: ['medium', DEFAULT_STYLES.warningColor],
              left: ['medium', DEFAULT_STYLES.warningColor],
            },
          };
        case 'Error':
          return {
            [changeKey]: {
              top: ['medium', DEFAULT_STYLES.errorColor],
              right: ['medium', DEFAULT_STYLES.errorColor],
              bottom: ['medium', DEFAULT_STYLES.errorColor],
              left: ['medium', DEFAULT_STYLES.errorColor],
            },
          };
        case 'CustomBorders':
          return { [changeKey]: JSON.parse(borders) };
        default:
          return {
            [changeKey]: {
              top: ['medium', DEFAULT_STYLES.defaultColor],
              right: ['medium', DEFAULT_STYLES.defaultColor],
              bottom: ['medium', DEFAULT_STYLES.defaultColor],
              left: ['medium', DEFAULT_STYLES.defaultColor],
            },
          };
      }
    } else {
      switch (color) {
        case 'Default':
          return { [changeKey]: DEFAULT_STYLES.defaultColor };
        case 'Success':
          return { [changeKey]: DEFAULT_STYLES.successColor };
        case 'Info':
          return { [changeKey]: DEFAULT_STYLES.infoColor };
        case 'Warning':
          return { [changeKey]: DEFAULT_STYLES.warningColor };
        case 'Error':
          return { [changeKey]: DEFAULT_STYLES.errorColor };
        default:
          return { [changeKey]: color };
      }
    }
  }

  private getPaintTargetTable(key: PaintTargetType): PaintTargetResTableType {
    switch (key) {
      case 'FillColor':
        return 'bgcolor';
      case 'Shape':
      case 'StrokeColor':
        return 'border';
      case 'Label':
        return 'color';
      default:
        return null;
    }
  }
}

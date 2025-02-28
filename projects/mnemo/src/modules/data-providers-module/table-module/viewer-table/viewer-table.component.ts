/* eslint-disable import/no-extraneous-dependencies */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { saveAs } from 'file-saver';
import { filter, of, switchMap } from 'rxjs';
import {
  BorderType,
  ICellObject,
  ICssStyleObject,
  IFormulaCalcRes,
  IPostTag,
  IStyleObject,
  ITableParams,
  ITableStructure,
  ITagsValues,
  TagType,
} from '../../../../models';
import { PopupService, RtdbFormulaApiService, RtdbTagApiService } from '../../../../services';
import {
  ManualTagModalComponent,
  PlayerModeService,
  TooltipTemplateService,
  ViewerFormulaService,
  ViewerHelperService,
  ViewerIntervalService,
  ViewerRefreshService,
  ViewerService,
  ViewerTagService,
} from '../../../pure-modules';
import { ViewerPopupChartService } from '../viewer-popup-chart/viewer-popup-chart.service';
import { IStyleAndValueTable, TableRuleService } from './table-rule.service';
import { TableService } from './table.service';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-viewer-table',
  templateUrl: './viewer-table.component.html',
  styleUrls: ['./viewer-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerTableComponent implements OnInit, AfterViewInit, OnDestroy {
  public viewerService = inject(ViewerService);
  public viewerHelperService = inject(ViewerHelperService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly tableRuleService = inject(TableRuleService);
  private readonly popupChartService = inject(ViewerPopupChartService);
  private readonly popupService = inject(PopupService);
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly rtdbFormulaApiService = inject(RtdbFormulaApiService);
  public tableService = inject(TableService);
  public tooltipTemplateService = inject(TooltipTemplateService);
  public viewerTagService = inject(ViewerTagService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly viewerRefreshService = inject(ViewerRefreshService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);

  @Input() public data: ITableStructure | null = null;
  public sizeEvents: number | null = null;
  public disableEvents: boolean = true;
  public errorIconMap: Map<string, boolean> = new Map<string, boolean>();
  public tagNameForChartContext: { tagName: string; ri: number; ci: number } | null = null;

  public currentZoom: number = 1;
  private readonly zoomArr: number[] = [0.25, 0.5, 1, 2, 4];

  @Input()
  public set reSizeWorkArea(v: [number, number]) {
    this.onClickZoom('def');
  }

  public ngOnInit(): void {
    if (!this.data) return;

    const { rLen } = this.tableService.getRowsColsLen(this.data);
    if (!this.data?.rows?.len) {
      this.data.rows.len = rLen;
    }
    if (!this.data?.cols?.len) {
      this.data.cols.len = rLen;
    }

    this.getCellTagName();

    this.viewerTagService.updateTagData$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this),
      )
      .subscribe((d) => {
        if (!this.data) {
          return;
        }
        this.setTagsValue(d);
      });

    this.viewerTagService.updateTagDataPlayer$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this),
      )
      .subscribe((d) => {
        if (!this.data) {
          return;
        }
        this.setTagsValue(d);
      });

    this.viewerFormulaService.formulaInit$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this),
      )
      .subscribe(() => {
        if (!this.data) return;
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of this.viewerTagService.tagTableParamsMap.entries()) {
          if (value.sourceType === 'formula') {
            this.setFormulaInterval(key, value);
          }
        }
      });

    this.viewerService.toolbarButtonEmit$.pipe(takeUntilDestroyed(this)).subscribe((type) => {
      switch (type) {
        case 'zoomIn':
          this.onClickZoom('in');
          break;
        case 'zoomOut':
          this.onClickZoom('out');
          break;
        case 'zoomDefault':
          this.onClickZoom('def');
          break;
        case 'save':
          this.onClickSave();
          break;
        case 'print':
          break;
        default:
          break;
      }
    });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => this.setRowColSpan(), 1000);
  }

  public ngOnDestroy(): void {
    this.viewerRefreshService.stopUpdate();
    this.clearFormulaInterval();
  }

  public getHeight(ri: number): number | null {
    return (this.data?.rows[ri]?.height ?? 35) * this.currentZoom;
  }

  public getWidth(ci: number): number | null {
    return (this.data?.cols[ci]?.width ?? 100) * this.currentZoom;
  }

  public getValue(ri: number, ci: number): string {
    return this.data?.rows[ri]?.cells?.[ci]?.text;
  }

  public getStatus(ri: number, ci: number): string {
    return this.data?.rows[ri]?.cells?.[ci]?.status?.toString();
  }

  public getCellType(ri: number, ci: number): TagType {
    const param = this.viewerTagService.tagTableParamsMap.get(`${this.tableService.xy2expr(ri, ci)}`);
    if (param?.sourceType === 'formula') {
      return 'TLTAG';
    }
    if (param?.tagType === 'TLTAG') {
      return 'TLTAG';
    }
    if (param?.tagType === 'TLMANUALTAG') {
      return 'TLMANUALTAG';
    }

    const cell = this.data?.rows[ri]?.cells?.[ci];
    if (cell?.sourceType === 'formula') {
      return 'TLTAG';
    }
    if (cell?.text?.slice(0, 7) === '=TLTAG(') {
      return 'TLTAG';
    }
    if (cell?.text?.slice(0, 13) === '=TLMANUALTAG(') {
      return 'TLMANUALTAG';
    }
    return 'DEFAULT';
  }

  public getClass(ri: number, ci: number): string {
    const cell = this.data?.rows[ri]?.cells?.[ci];
    const invisible = cell?.invisible ? 'cell-content_invisible' : '';
    const blink = cell?.blink ? 'cell-content_blink' : '';
    return `${invisible} ${blink}`;
  }

  public getBorderStyle(ri: number, ci: number): Object {
    const styleIndex = this.data?.rows[ri]?.cells?.[ci]?.style;
    if (styleIndex !== undefined) {
      const styleObject: IStyleObject = this.data.styles[styleIndex];
      const resStyleObject: ICssStyleObject = {};
      resStyleObject['border-top'] = this.getBorder(styleObject.border?.top);
      resStyleObject['border-right'] = this.getBorder(styleObject.border?.right);
      resStyleObject['border-bottom'] = this.getBorder(styleObject.border?.bottom);
      resStyleObject['border-left'] = this.getBorder(styleObject.border?.left);
      return resStyleObject;
    }

    return null;
  }

  public getStyle(ri: number, ci: number): Object {
    const styleIndex = this.data?.rows[ri]?.cells?.[ci]?.style;
    if (styleIndex !== undefined) {
      const styleObject: IStyleObject = this.data.styles[styleIndex];
      const resStyleObject: ICssStyleObject = {};

      // text
      resStyleObject['font-size'] =
        `${(styleObject.font?.size ? styleObject.font?.size || 0 : 11) * this.currentZoom}px`;
      resStyleObject['font-family'] = styleObject.font?.name;
      resStyleObject['font-style'] = styleObject.font?.italic ? 'italic' : undefined;
      resStyleObject['font-weight'] = styleObject.font?.bold ? 'bold' : undefined;

      if (styleObject.underline && !styleObject.strike) {
        resStyleObject['text-decoration'] = 'underline';
      } else if (styleObject.strike && !styleObject.underline) {
        resStyleObject['text-decoration'] = 'line-through';
      } else if (styleObject.strike && styleObject.underline) {
        resStyleObject['text-decoration'] = 'underline line-through';
      }

      resStyleObject['white-space'] = !styleObject?.textwrap ? 'nowrap' : 'pre-wrap';

      // color, bg, border
      resStyleObject.color = styleObject.color;
      resStyleObject.background = styleObject.bgcolor;

      // align
      resStyleObject['align-items'] = this.getVerticalAlign(styleObject.valign);
      resStyleObject['justify-content'] = this.getAlign(styleObject.align);
      return resStyleObject;
    }
    return { 'font-size': `${11 * this.currentZoom}px` };
  }

  public getTooltip(ri: number, ci: number): string {
    const param = this.viewerTagService.tagTableParamsMap.get(`${this.tableService.xy2expr(ri, ci)}`);
    document.getElementById('mxTooltip').innerHTML = param?.formula?.length
      ? this.tooltipTemplateService.getTooltipTemplateFormula(
        param.val,
        param.formula,
        param.timeStamp,
        param.formulaValid,
      )
      : this.tooltipTemplateService.getTooltipTemplateTag(param.text, param.tagName, param.timeStamp, param.status);
    return '';
  }

  public getErrorIcon(ri: number, ci: number): boolean {
    return this.errorIconMap.get(`${this.tableService.xy2expr(ri, ci)}`);
  }

  public setHoveredCell(ri: number, ci: number): void {
    const param = this.viewerTagService.tagTableParamsMap.get(`${this.tableService.xy2expr(ri, ci)}`);
    this.tagNameForChartContext = { tagName: param?.tagName, ri, ci };
  }

  public showChart(tagName: string): void {
    this.viewerService.hiddenChartOpt = false;
    this.popupChartService.showChart(tagName);
  }

  public openManualTag(event: MouseEvent, ri: number, ci: number): void {
    const cell = this.tableService.xy2expr(ri, ci);
    const param = this.viewerTagService.tagTableParamsMap.get(cell);
    this.popupService
      .open(
        ManualTagModalComponent,
        { param },
        {
          origin: event.target as unknown as ElementRef<HTMLDivElement>,
          positions: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        },
      )
      .popupRef.afterClosed()
      .pipe(
        switchMap((res: { date: Date; value: number; comment: string; status: number }) => {
          if (res.value) {
            param.manualTagValue = res.value;
            param.manualTagDate = res.date;
            param.manualTagComment = res.comment;

            return this.rtdbTagApiService.postManualTagData([
              {
                id: param?.tagId ?? (this.viewerTagService.tagNameIdMap.get(param.tagName) as number),
                guid: param?.tagGuid ?? (this.viewerTagService.tagNameGuidMap.get(param.tagName) as number),
                status: res.status,
                time: res.date,
                val: res.value.toString(),
                comment: res.comment,
              } as IPostTag,
            ]);
          }
          return of([]);
        }),
      )
      .subscribe({
        next: () => this.cdr.markForCheck(),
        error: () => this.cdr.markForCheck(),
      });
  }

  public setRowColSpan(): void {
    if (this.data?.merges) {
      this.data.merges?.forEach((m) => {
        const range = m.split(':');
        const [sr, sc] = this.tableService.expr2xy(range[0]);
        const [er, ec] = this.tableService.expr2xy(range[1]);
        const rowspanCount = ec - sc;
        const colspanCount = er - sr;
        const startCell = document.getElementById(this.tableService.xy2expr(sr, sc));

        if ((rowspanCount >= 1 || colspanCount >= 1) && startCell) {
          startCell.classList.add('is-rowspan');
          startCell.classList.add('is-colspan');
          startCell.setAttribute('rowspan', (rowspanCount + 1).toString());
          startCell.setAttribute('colspan', (colspanCount + 1).toString());
          // eslint-disable-next-line no-plusplus
          for (let i = sc; i <= ec; i++) {
            if (i !== sc) {
              document.getElementById(this.tableService.xy2expr(sr, i))?.classList?.add('is-rowspan_hidden');
            }
            // eslint-disable-next-line no-plusplus
            for (let j = sr + 1; j <= er; j++) {
              document.getElementById(this.tableService.xy2expr(j, i))?.classList?.add('is-colspan_hidden');
            }
          }
        }
      });
    }
  }

  private getCellTagName(): void {
    const rowsObject = this.data?.rows;
    const tagsNames: string[] = [];
    const tagsNamesRounded: string[] = [];
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const ri in rowsObject) {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const ci in rowsObject[ri]?.cells) {
        const cellObject: ICellObject = rowsObject[ri]?.cells?.[ci];
        const key = this.tableService.xy2expr(Number(ri), Number(ci));
        let tagType = '';
        let tagName = '';

        if (this.disableEvents && cellObject?.loadEvents) {
          this.disableEvents = false;
        }

        if (cellObject?.tagName) {
          tagName = cellObject.tagName.trim();
          if (cellObject?.text?.slice(0, 7) === '=TLTAG(') {
            tagType = 'TLTAG';
          } else if (cellObject?.text?.slice(0, 13) === '=TLMANUALTAG(') {
            tagType = 'TLMANUALTAG';
          }
        } else if (cellObject?.text?.match(/=(.*)\((.*)\)/)) {
          const res = cellObject?.text?.match(/=(.*)\((.*)\)/);
          if (res) {
            rowsObject[ri].cells[ci].tagName = res?.[2];
            tagType = res?.[1];
            tagName = res?.[2]?.trim();
          }
        }

        if (cellObject?.sourceType === 'formula') {
          this.viewerFormulaService.formulaMap.set(key, null);
          tagName = cellObject?.formula;
        }

        this.viewerTagService.tagTableParamsMap.set(key, {
          ...cellObject,
          tagType,
          tagName,
          ri: Number(ri),
          ci: Number(ci),
          A1Tag: key,
        });

        if (cellObject.sourceType !== 'formula' && !!cellObject.tagName?.length) {
          if (!cellObject?.roundValue) {
            tagsNames.push(cellObject.tagName);
          } else {
            tagsNamesRounded.push(cellObject.tagName);
          }
        }

        this.errorIconMap.set(key, false);
      }
    }
    const nameArr: { name: string; roundValue: boolean }[] = [
      ...Array.from(new Set(tagsNames)).map((t) => {
        return { name: t, roundValue: false };
      }),
      ...Array.from(new Set(tagsNamesRounded)).map((t) => {
        return { name: t, roundValue: true };
      }),
    ].sort();

    this.viewerTagService.tagsNames$.next(nameArr);
    this.viewerIntervalService.initSubscribe();

    if (!nameArr?.length) {
      this.viewerFormulaService.formulaInit$.next(true);
    }

    if (this.disableEvents) {
      this.sizeEvents = 0;
    } else {
      this.sizeEvents = 5;
    }
  }

  private setTagsValue(data: ITagsValues[]): void {
    // eslint-disable-next-line no-restricted-syntax, prefer-const
    for (let [key, tagParams] of this.viewerTagService.tagTableParamsMap.entries()) {
      let dataObj: ITagsValues = null;

      if (tagParams.roundValue) {
        dataObj = data.find((t) => t.name === tagParams.tagName && t.withFormat);
      }

      if (!dataObj) {
        dataObj = data.find((t) => t.name === tagParams.tagName && !t.withFormat);
      }

      if (tagParams.sourceType === 'formula') {
        this.setFormulaInterval(key, tagParams);
        // eslint-disable-next-line no-continue
        continue;
      }

      if (tagParams && (tagParams.tagType === 'TLTAG' || tagParams.tagType === 'TLMANUALTAG') && dataObj) {
        tagParams = Object.assign(tagParams, {
          val: dataObj.val,
          tagId: dataObj?.id ?? this.viewerTagService.tagNameIdMap.get(dataObj.name),
          tagGuid: dataObj?.guid ?? this.viewerTagService.tagNameGuidMap.get(dataObj.name),
          status: dataObj.status,
          timeStamp: dataObj?.time ? new Date(dataObj.time) : new Date(-1),
          time: dataObj?.time,
          hiddenValue: null,
          invisible: null,
          blink: null,
          showUnits: null,
          unitName: null,
        });

        const cellObject: ICellObject = this.data.rows[tagParams.ri]?.cells?.[tagParams.ci];
        this.setTagValue(key, tagParams, cellObject);
      }
    }
    this.cdr.markForCheck();
  }

  private setTagValue(key: string, tagParams: ITableParams, cellObject: ICellObject): void {
    if (!this.playerModeService.isPlayerMode) {
      if (!cellObject.showWarning) {
        this.errorIconMap.set(key, false);
      } else {
        this.errorIconMap.set(key, Date.now() - new Date(tagParams.time).getTime() > 120000);
      }
    }

    const status = this.viewerHelperService.getStatus(tagParams.status);

    let val = tagParams?.val?.toString();

    if (tagParams.tagRules?.length) {
      const defaultRul: {
        tagRules: string;
        tagDefStyle: object | null;
      } = this.tableRuleService.addDefaultValueTable(this.data.styles[tagParams.style], tagParams.tagRules);

      if (defaultRul) {
        cellObject.tagRules = defaultRul.tagRules;
        cellObject.tagDefStyle = defaultRul.tagDefStyle;
      }

      const resultRules: IStyleAndValueTable = this.tableRuleService.getStyleAndValueTable(
        tagParams.val as number,
        cellObject.tagRules,
        status,
        cellObject.tagDefStyle,
        this.data.styles[tagParams.style],
      );
      val = resultRules.value?.toString() ?? tagParams?.val?.toString();
      this.data.styles[tagParams.style] = resultRules?.style;

      tagParams.invisible = resultRules?.invisible;
      tagParams.blink = resultRules?.blink;
    }

    if (cellObject?.showUnits) {
      tagParams.showUnits = cellObject.showUnits;
      const unit = this.viewerTagService.tagMetaInfoMap.get(cellObject.tagName)?.unitName;
      if (unit) {
        tagParams.unitName = unit === 'Нет' ? '' : unit;
      } else {
        tagParams.unitName = '';
      }
      val += tagParams.unitName?.length ? ` ${tagParams.unitName}` : '';
    }

    if (cellObject.disableValue) {
      val = '';
      tagParams.hiddenValue = val;
    } else if (status === 'Bad') {
      val = 'Bad';
    }

    this.data.rows[tagParams.ri].cells[tagParams.ci] = {
      ...cellObject,
      tagRules: cellObject.tagRules,
      text: val,
    };

    this.viewerTagService.tagTableParamsMap.set(key, {
      ...tagParams,
      tagRules: cellObject.tagRules,
      text: val,
    });

    this.cdr.markForCheck();
  }

  private getBorder(border: [BorderType, string] | null): string {
    if (!border) return undefined;
    switch (border[0]) {
      case 'thin':
        return `1px solid ${border[1]}`;
      case 'medium':
        return `2px solid ${border[1]}`;
      case 'thick':
        return `3px solid ${border[1]}`;
      case 'dotted':
        return `1px dotted ${border[1]}`;
      case 'dashed':
        return `1px dashed ${border[1]}`;
      default:
        return undefined;
    }
  }

  private getVerticalAlign(align: 'top' | 'middle' | 'bottom' | undefined): 'start' | 'center' | 'end' | undefined {
    if (!align) return 'center';
    switch (align) {
      case 'top':
        return 'start';
      case 'middle':
        return 'center';
      case 'bottom':
        return 'end';
      default:
        return undefined;
    }
  }

  private getAlign(align: 'left' | 'center' | 'right' | undefined): 'start' | 'center' | 'end' | undefined {
    if (!align) return 'center';
    switch (align) {
      case 'left':
        return 'start';
      case 'center':
        return 'center';
      case 'right':
        return 'end';
      default:
        return undefined;
    }
  }

  private onClickZoom(dir: 'in' | 'out' | 'def'): void {
    const index = this.zoomArr.findIndex((d) => d === this.currentZoom);
    switch (dir) {
      case 'def':
        this.currentZoom = 1;
        break;
      case 'in':
        this.currentZoom = index === this.zoomArr.length - 1 ? this.zoomArr[0] : this.zoomArr[index + 1];
        break;
      case 'out':
        this.currentZoom = index <= 0 ? this.zoomArr[this.zoomArr.length - 1] : this.zoomArr[index - 1];
        break;
      default:
        break;
    }
    this.cdr.markForCheck();
  }

  private onClickSave(): void {
    if (!this.data) return;
    const filename = `${
      this.viewerService.selectedNodeName$.value
        ? this.viewerService.selectedNodeName$.value
        : `table${new Date().toLocaleString()}`
    }.json`;
    const file: File = this.getJsonFile(this.data, filename);
    saveAs(file, filename);
  }

  private getJsonFile(data: unknown, name: string): File {
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    return new File([blob], name);
  }

  private setFormulaInterval(key: string, tagParams: ITableParams): void {
    const interval = this.viewerFormulaService.formulaMap.get(key);
    if (!interval) {
      this.getFormulaValue(key, tagParams);
      this.viewerFormulaService.formulaMap.set(
        key,
        setInterval(() => this.getFormulaValue(key, tagParams), tagParams.formulaInterval * 1000),
      );
    }
  }

  private clearFormulaInterval(): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const interval of this.viewerFormulaService.formulaMap.values()) {
      clearInterval(interval);
    }
    this.viewerFormulaService.formulaMap.clear();
  }

  private getFormulaValue(key: string, tagParams: ITableParams): void {
    this.rtdbFormulaApiService.getCalcByFormula<IFormulaCalcRes>(tagParams.formula).subscribe((res) => {
      if (res.result[0] !== tagParams.text) {
        // @ts-ignore
        [tagParams.val] = res.result;
        tagParams.timeStamp = new Date();
        tagParams.formulaValid = res.valid;
        tagParams.status = res?.valid ? 192 : 0;

        if (!tagParams?.showUnits) {
          tagParams.unitName = '';
        }

        const cellObject: ICellObject = this.data.rows[tagParams.ri]?.cells?.[tagParams.ci];
        this.setTagValue(key, tagParams, cellObject);
      }
    });
  }
}

/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { ViewerHelperService } from './viewer-helper.service';
import { TagStatusEnum } from '../../../../models';

@Injectable()
export class TooltipTemplateService {
  private readonly viewerHelperService = inject(ViewerHelperService);

  public getTooltipTemplateTag(value: string, name: string, timeStamp: Date, status: number): string {
    // eslint-disable-next-line no-nested-ternary, no-unsafe-optional-chaining
    const className = timeStamp ? (Date.now() - timeStamp?.getTime() > 120000 ? 'warning' : 'normal') : 'warning';
    const timeStampTd = timeStamp
      ? `<span class="${className}">${timeStamp.toLocaleString()}</span>`
      : `<span class="danger">${this.viewerHelperService.getTranslate('incorrectTimeStamp')}</span>`;

    let statusTd: string = `<span class="danger">Bad</span>`;
    let valueTd: string = `<span class="danger">Bad</span>`;
    let statusString: string = 'Bad';

    if (status) {
      statusString = this.viewerHelperService.getStatus(status);
    }
    if (statusString === TagStatusEnum.Good) {
      statusTd = `<span class="good">Good</span>`;
      valueTd = `<span class="good">${value}</span>`;
    } else if (statusString === TagStatusEnum.Uncertan) {
      statusTd = `<span class="warning">Uncertan</span>`;
      valueTd = `<span class="warning">${value}</span>`;
    } else {
      statusTd = '<span class="danger">Bad</span>';
      valueTd = `<span class="danger">Bad</span>`;
    }

    if (this.viewerHelperService.getActiveLang() === 'fa') {
      return (
        `<table><tbody>` +
        `<tr><td style="text-align: right">${name}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('tagName')}</td></tr>` +
        `<tr><td style="text-align: right">${valueTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('value')}</td></tr>` +
        `<tr><td style="text-align: right">${timeStampTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('timeStamp')}</td></tr>` +
        `<tr><td style="text-align: right">${statusTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('status')}</td></tr>` +
        `</tbody></table>`
      );
    }
    return (
      `<table><tbody>` +
      `<tr><td>${this.viewerHelperService.getTranslate('tagName')}:</td><td>${name}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('value')}:</td><td>${valueTd}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('timeStamp')}:</td><td>${timeStampTd}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('status')}:</td><td>${statusTd}</td></tr>` +
      `</tbody></table>`
    );
  }

  public getTooltipTemplateOM(value: string, name: string, timeStamp: Date, status: number): string {
    // eslint-disable-next-line no-nested-ternary, no-unsafe-optional-chaining
    const className = !timeStamp ? (Date.now() - timeStamp?.getTime() > 120000 ? 'warning' : 'normal') : 'warning';
    const timeStampTd = timeStamp
      ? `<span class="${className}">${timeStamp.toLocaleString()}</span>`
      : `<span class="danger">${this.viewerHelperService.getTranslate('incorrectTimeStamp')}</span>`;

    let statusTd: string = `<span class="danger">Bad</span>`;
    let valueTd: string = `<span class="danger">Bad</span>`;
    let statusString: string = 'Bad';

    if (status) {
      statusString = this.viewerHelperService.getStatus(status);
    }
    if (statusString === TagStatusEnum.Good) {
      statusTd = `<span class="good">Good</span>`;
      valueTd = `<span class="good">${value}</span>`;
    } else if (statusString === TagStatusEnum.Uncertan) {
      statusTd = `<span class="warning">Uncertan</span>`;
      valueTd = `<span class="warning">${value}</span>`;
    } else {
      statusTd = '<span class="danger">Bad</span>';
      valueTd = `<span class="danger">${value}</span>`;
    }

    if (this.viewerHelperService.getActiveLang() === 'fa') {
      return (
        `<table><tbody>` +
        `<tr><td style="text-align: right">${name}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('omAttrName')}</td></tr>` +
        `<tr><td style="text-align: right">${valueTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('value')}</td></tr>` +
        `<tr><td style="text-align: right">${timeStampTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('timeStamp')}</td></tr>` +
        `<tr><td style="text-align: right">${statusTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('status')}</td></tr>` +
        `</tbody></table>`
      );
    }
    return (
      `<table><tbody>` +
      `<tr><td>${this.viewerHelperService.getTranslate('omAttrName')}:</td><td>${name}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('value')}:</td><td>${valueTd}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('timeStamp')}:</td><td>${timeStampTd}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('status')}:</td><td>${statusTd}</td></tr>` +
      `</tbody></table>`
    );
  }

  public getTooltipTemplateFormula(value: unknown, formula: string, timeStamp: Date, formulaValid: boolean): string {
    let statusTd: string = `<span class="danger">Bad</span>`;
    let valueTd: string = `<span class="danger">Bad</span>`;

    if (formulaValid) {
      statusTd = `<span class="good">Good</span>`;
      valueTd = `<span class="good">${value}</span>`;
    }

    // eslint-disable-next-line no-nested-ternary, no-unsafe-optional-chaining
    const className = timeStamp ? (Date.now() - timeStamp?.getTime() > 120000 ? 'warning' : 'normal') : 'warning';
    const timeStampTd = timeStamp
      ? `<span class="${className}">${timeStamp.toLocaleString()}</span>`
      : `<span class="danger">${this.viewerHelperService.getTranslate('incorrectTimeStamp')}</span>`;

    if (this.viewerHelperService.getActiveLang() === 'fa') {
      return (
        `<table><tbody>` +
        `<tr><td style="text-align: right">${formula}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('formula')}</td></tr>` +
        `<tr><td style="text-align: right">${valueTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('value')}</td></tr>` +
        `<tr><td style="text-align: right">${timeStamp}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('timeStamp')}</td></tr>` +
        `<tr><td style="text-align: right">${statusTd}</td><td style="text-align: right">:${this.viewerHelperService.getTranslate('status')}</td></tr>` +
        `</tbody></table>`
      );
    }

    return (
      `<table><tbody>` +
      `<tr><td>${this.viewerHelperService.getTranslate('formula')}:</td><td>${formula}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('value')}:</td><td>${valueTd}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('timeStamp')}:</td><td>${timeStampTd}</td></tr>` +
      `<tr><td>${this.viewerHelperService.getTranslate('status')}:</td><td>${statusTd}</td></tr>` +
      `</tbody></table>`
    );
  }
}

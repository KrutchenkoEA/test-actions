/* eslint-disable import/no-extraneous-dependencies */
import { EventEmitter, Injectable, Output, inject } from '@angular/core';
import * as convert from 'xml-js';
import { TranslocoService } from '@jsverse/transloco';
import { SnackBarService } from '@tl-platform/core';

@Injectable()
export class FileUploadService {
  private readonly translocoService = inject(TranslocoService);
  private readonly snackBarService = inject(SnackBarService);

  public file: File | null = null;
  public accept: string[] = ['application/json', 'application/xml', 'text/xml'];
  public extension: string = '.xml, .json';
  public isXml: boolean = true;

  @Output()
  public fileUpload: EventEmitter<{ xml: string | null; json: string | null }> = new EventEmitter<{
    xml: null;
    json: null;
  }>();

  public read(): void {
    if (this.isXml) {
      this.readXmlFile();
    } else {
      this.readFile();
    }
  }

  public checkAndRead(): void {
    this.isXml = this.file.type === 'text/xml' || this.file.type === 'application/xml';
    if (this.file && this.isFileOfAcceptedType(this.file) && this.isXml) {
      this.readXmlFile();
    } else if (this.file && this.isFileOfAcceptedType(this.file) && !this.isXml) {
      this.readFile();
    } else {
      this.snackBarService.openSnackBar(
        this.translocoService.translate<string>('message.UploadControlComponent.wrongFormat'),
        'error'
      );
    }
  }

  private readFile(): void {
    const fileReader: FileReader = new FileReader();
    fileReader.onloadend = (): void => {
      this.fileUpload.emit({ xml: null, json: fileReader.result as string });
    };
    fileReader.readAsText(this.file);
  }

  private readXmlFile(): void {
    const fileReader: FileReader = new FileReader();

    try {
      fileReader.readAsText(this.file, 'utf-8');
    } catch (e) {
      fileReader.readAsBinaryString(this.file);
    }

    fileReader.onloadend = (): void => {
      const jsonResult = convert.xml2json(fileReader.result as string, { compact: false, spaces: 4 });
      this.fileUpload.emit({ xml: fileReader.result as string, json: jsonResult });
    };
  }

  private isFileOfAcceptedType(file: File): boolean {
    if (this.accept) {
      return !!this.accept.find((d) => d === file.type);
    }

    return true;
  }
}

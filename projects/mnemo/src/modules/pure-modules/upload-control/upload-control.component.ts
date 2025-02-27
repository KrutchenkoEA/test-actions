/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { BehaviorSubject } from 'rxjs';
import { FileUploadService } from './file-upload.service';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-viewer-upload-control',
  templateUrl: './upload-control.component.html',
  styleUrls: ['./upload-control.component.scss'],
  providers: [FileUploadService],
  standalone: true,
  imports: [TranslocoDirective, AsyncPipe, SvgIconComponent, NgIf],
})
export class UploadControlComponent implements OnInit {
  private readonly fileUploadService = inject(FileUploadService);

  @Output()
  public fileUpload: EventEmitter<{ xml: string | null; json: string | null }> = new EventEmitter<{
    xml: null;
    json: null;
  }>();

  @Input() public accept: string[] = ['application/json', 'application/xml', 'text/xml'];
  @Input() public extension: string = '.xml, .json';
  @Input() public isXml: boolean = true;

  public isDragging$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public ngOnInit(): void {
    this.fileUploadService.accept = this.accept;
    this.fileUploadService.extension = this.extension;
    this.fileUploadService.isXml = this.isXml;
    this.fileUploadService.fileUpload.pipe(takeUntilDestroyed(this)).subscribe((d) => this.fileUpload.emit(d));
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging$.next(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging$.next(false);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging$.next(false);
    // eslint-disable-next-line prefer-destructuring
    this.fileUploadService.file = event.dataTransfer.files[0];
    this.fileUploadService.checkAndRead();
  }

  public onFileChange(event): void {
    [this.fileUploadService.file] = event.target.files;
    this.fileUploadService.checkAndRead();
  }
}

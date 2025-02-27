/* eslint-disable import/no-extraneous-dependencies */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy, LANGUAGE, takeUntilDestroyed } from '@tl-platform/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataType, EmitterNameType, IConnection, ISourceModalResult, MethodType } from '../../../../models';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-om-tag-form',
  templateUrl: './om-tag-form.component.html',
  styleUrls: ['./om-tag-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmTagFormComponent implements OnInit, AfterViewInit {
  readonly language$ = inject<Observable<string>>(LANGUAGE);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() public baseUrl: string;
  @Input() public multipleSelect: boolean = false;
  @Input() public multipleSelectObject: boolean = false;
  @Input() public selectedPathArray: string[] = [];
  @Input() public methods: MethodType[] = ['tag', 'objectModel'];
  @Input() public enablePropTable: boolean = true;
  @Input() public currentMethod: MethodType = this.methods[0];
  @Input() public filterAttributeType: DataType | null = null;
  @Input() public showConnection: boolean = true;
  @Input() public cacheTree: boolean = true;
  @Input() public cacheAttributes: boolean = true;
  @Output() public attributeSelectedEmitter: EventEmitter<ISourceModalResult> = new EventEmitter<ISourceModalResult>();
  @Output() public checkboxSelectedEmitter: EventEmitter<ISourceModalResult> = new EventEmitter<ISourceModalResult>();

  public splitSize: number = 100;

  // todo Ожидаем когда будет доступно на беке
  public connections: IConnection[] = [];
  public searchString: string = '';
  public searchString$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public selectedConnection: IConnection | null = null;
  public selected: ISourceModalResult | null = null;
  public readonly form = new FormGroup({
    method: new FormControl<MethodType>(this.currentMethod),
    connection: new FormControl<IConnection | null>(null),
    search: new FormControl<string>(''),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public selected$: Subject<{ source: any[]; key: EmitterNameType }> = new Subject();
  public clear$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);

  @Input()
  public set clear(v: boolean | null) {
    if (v === null) return;
    this.clear$.next(v);
  }

  public ngAfterViewInit(): void {
    this.splitSize = 90;
  }

  public ngOnInit(): void {
    this.form.controls.method.patchValue(this.currentMethod);
    this.search();

    // this.rtdbService.getConnections().subscribe({
    //   next: (c) => {
    //     this.connections = c;
    //     this.cdr.markForCheck();
    //   },
    //   error: () => {
    //     this.connections = [];
    //     this.cdr.markForCheck();
    //   },
    // });

    this.form.controls.method.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((d) => {
      this.currentMethod = d;
      this.selectAttributes({ multiple: this.multipleSelect });
      this.cdr.markForCheck();
    });

    this.form.controls.connection.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((c) => {
      this.selectedConnection = c;
    });

    this.form.controls.search.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((search) => {
      this.searchString = search;
    });
  }

  public selectAttributes(tags: ISourceModalResult): void {
    this.selected = tags;
    this.attributeSelectedEmitter.emit(tags);
  }

  public searchKeyboardClick(key: KeyboardEvent): void {
    if (key && (key?.code === 'Enter' || key.code === 'NumpadEnter')) {
      this.searchString$.next(this.searchString);
    }
  }

  public search(): void {
    this.searchString$.next(this.searchString);
  }

  public deleteItem<U>(idx: number, source: U[], key: EmitterNameType): void {
    source?.splice(idx, 1);
    this.selected$.next({ source, key });
    this.cdr.markForCheck();
  }
}

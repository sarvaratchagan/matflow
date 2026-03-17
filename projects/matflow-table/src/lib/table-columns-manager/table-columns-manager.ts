import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  GlobalPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef
} from '@angular/cdk/overlay';

import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TemplatePortal } from '@angular/cdk/portal';

import { EMPTY, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, startWith, take, takeUntil } from 'rxjs/operators';

import { TableColumnFormGroup, FormMode, TableColumnFormGroupType } from '../table-column-manager/table-column-manager';
import { TableColumn } from '../table-column/table-column';
import { TABLE_SETTINGS_SOURCE } from '../table/table-settings-source.token';
import { TableSettingsSource } from '../table/table-settings-source';

@Component({
  selector: 'matflow-table-columns-manager',
  templateUrl: './table-columns-manager.html',
  styleUrl: './table-columns-manager.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnsManager implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private overlayRef?: OverlayRef;

  @Output()
  displayedColumnsChanged = new EventEmitter<string[]>();

  formGroup = new FormGroup({
    columns: new FormArray<TableColumnFormGroup>([])
  });

  /**
   * Currently selected table columns
   */
  usedTableColumns$!: Observable<TableColumn[]>;

  constructor(
    @Inject(TABLE_SETTINGS_SOURCE)
    private tableSettingsSource: TableSettingsSource,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.usedTableColumns$ = this.formGroup.controls.columns.valueChanges.pipe(
      startWith(undefined),
      map((columns) => {
        return (
          (columns ?? [])
          ?.map(c => c.tableColumn)
          ?.filter((c): c is TableColumn => !!c)
        )
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }

  remove(columnFormGroup: TableColumnFormGroup): void {
    const index =
      this.formGroup.controls.columns.controls.indexOf(columnFormGroup);

    if (index >= 0) {
      this.formGroup.controls.columns.removeAt(index);
    }
  }

  drop(event: CdkDragDrop<TableColumnFormGroup>): void {

    const formArray = this.formGroup.controls.columns;

    const from = event.previousIndex;
    const to = event.currentIndex;

    const dragged = formArray.at(from);

    formArray.removeAt(from);
    formArray.insert(to, dragged);
  }

  open(templateRef: TemplateRef<unknown>): void {

    const positionStrategy: GlobalPositionStrategy =
      this.overlay
        .position()
        .global()
        .right()
        .end()
        .centerVertically();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      height: '100%',
      disposeOnNavigation: true,
      backdropClass: 'location-search-overlay-backdrop',
      positionStrategy
    });

    this.overlayRef = this.overlay.create(overlayConfig);

    const portal = new TemplatePortal(
      templateRef,
      this.viewContainerRef
    );

    this.overlayRef.attach(portal);

    this.buildFormArray();

    this.overlayRef.backdropClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.close());
  }

  close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  add(): void {

    if (!this.formGroup.valid) return;

    const columnFormGroup: TableColumnFormGroup = new FormGroup<TableColumnFormGroupType>({
      tableColumn: new FormControl(null, {
        validators: Validators.required,
        nonNullable: true
      }),
      alias: new FormControl<string | null>(null),
      mode: new FormControl<FormMode>('columnSelector', { 
        nonNullable: true
      }),
      viewonly: new FormControl(false, { 
        nonNullable: true
      }),
      groupable: new FormControl(false, { 
        nonNullable: true
      }),
      required: new FormControl(false, { 
        nonNullable: true
      })
    });

    this.formGroup.controls.columns.push(columnFormGroup);
  }

  restore(): void {

    this.displayedColumnsChanged.emit(
      this.tableSettingsSource.defaultColumns
    );

    const defaultColumns$ = (
      this.tableSettingsSource.defaultTableColumns$ ?? EMPTY
    );

    defaultColumns$
      .pipe(
        filter((defaultColumns: TableColumn[]) => !!defaultColumns),
        take(1)
      )
      .subscribe((defaultColumns: TableColumn[]) => {

        this.tableSettingsSource
          .updateUserTableColumns(defaultColumns);

        this.close();
      });
  }

  save(): void {

    if (!this.formGroup.valid) return;

    const userColumns: TableColumn[] = this.formGroup.controls.columns
      .getRawValue()
      .map((col) => {
        if (!col.tableColumn){
          return null;
        }
        const column = { ...col.tableColumn };
        column.alias = col.alias ?? undefined;
      
        return column;
      })
      .filter((c): c is TableColumn => !!c);
    this.tableSettingsSource
      .updateUserTableColumns(userColumns);

    this.close();
  }

  private buildFormArray(): void {

    const formArray = this.formGroup.controls.columns;

    formArray.clear();

    this.tableSettingsSource.displayedTableColumns$
      ?.pipe(take(1))
      .subscribe(tableColumns => {

        tableColumns
          ?.filter(Boolean)
          ?.forEach(column => {

            formArray.push(
              new FormGroup<TableColumnFormGroupType>({
                tableColumn: new FormControl(column, {
                  validators: [Validators.required]
                }),
                alias: new FormControl(column.alias ?? null),
                mode: new FormControl<FormMode>(
                  column.alias ? 'labelEditor' : 'columnSelector',
                  { nonNullable: true }
                ),
                groupable: new FormControl(column.groupable ?? false, { nonNullable: true }),
                viewonly: new FormControl(column.computed ?? false, { nonNullable: true }),
                required: new FormControl(column.required ?? false, { nonNullable: true })
              }),
              { emitEvent: false }
            )

          });

        formArray.updateValueAndValidity({ emitEvent: true });
      });
  }
}

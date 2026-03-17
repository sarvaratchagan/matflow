import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input, OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  map,
  startWith, switchAll, EMPTY
} from 'rxjs';
import { TableColumn } from '../table-column/table-column';
import { TABLE_SETTINGS_SOURCE } from '../table/table-settings-source.token';
import { TableSettingsSource } from '../table/table-settings-source';

export type FormMode = 'columnSelector' | 'labelEditor';

export type TableColumnFormGroupType = {
  tableColumn: FormControl<TableColumn | null>;
  alias: FormControl<string | null>;
  mode: FormControl<FormMode>;
  viewonly: FormControl<boolean>;
  groupable: FormControl<boolean>;
  required: FormControl<boolean>;
};

export type TableColumnFormGroup = FormGroup<TableColumnFormGroupType>;

@Component({
  selector: 'matflow-table-column-manager',
  templateUrl: './table-column-manager.html',
  styleUrl: './table-column-manager.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnManager implements OnInit {

  @Output()
  remove = new EventEmitter<FormGroup>();

  private usedTableColumnsSubject = new ReplaySubject<TableColumn[]>(1);
  usedTableColumns$ = this.usedTableColumnsSubject.asObservable();

  private tableColumnFormGroupSubject =
    new ReplaySubject<TableColumnFormGroup>(1);

  tableColumnFormGroup$ =
    this.tableColumnFormGroupSubject.asObservable();

  @Input()
  set usedTableColumns(value: TableColumn[]) {
    this.usedTableColumnsSubject.next(value);
  }

  private _tableColumnFormGroup!: TableColumnFormGroup;

  get tableColumnFormGroup(): TableColumnFormGroup {
    return this._tableColumnFormGroup;
  }

  @Input()
  set tableColumnFormGroup(value: TableColumnFormGroup) {
    this._tableColumnFormGroup = value;
    this.tableColumnFormGroupSubject.next(value);

    if (!value.controls.tableColumn.value) {
      this.elementRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }

  readonly selectedTableColumn$: Observable<TableColumn | null> =
    this.tableColumnFormGroup$.pipe(
      map(fg => fg.controls.tableColumn),
      map(control =>
        control.valueChanges.pipe(
          startWith(control.value),
          map(v => v ?? null)
        )
      ),
      // flatten inner observable
      switchAll()
    );

   availableColumns$!: Observable<TableColumn[]>;

  constructor(
    @Inject(TABLE_SETTINGS_SOURCE)
    private tableSettingsSource: TableSettingsSource,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit() {
    this.availableColumns$ =
      combineLatest([
        this.tableSettingsSource.availableColumns$ ?? EMPTY,
        this.selectedTableColumn$,
        this.usedTableColumns$
      ]).pipe(
        map(([availableColumns, selectedColumn, usedColumns]: [
          TableColumn[], TableColumn | null, TableColumn[]
        ]) => {

          const filteredColumns = availableColumns
            ?.filter(col => col.queryable || col.computed)
            ?.filter(col => !col.hidden)
            ?.filter(col => {
              if (selectedColumn?.field === col.field) {
                return true;
              }

              return !usedColumns?.some(
                used => used.field === col.field
              );
            })
            ?.map(col => {

              const usedColumn = usedColumns?.find(
                used => used.field === col.field
              );

              if (usedColumn) {
                col.label = usedColumn.label;
              }

              return col;
            });

          return filteredColumns ?? [];
        })
      );
  }

  edit() {
    this.tableColumnFormGroup.controls.mode.setValue('labelEditor');
  }

  undo() {
    this.tableColumnFormGroup.controls.mode.setValue('columnSelector');
    this.tableColumnFormGroup.controls.alias.setValue(null);
  }

  compareTableColumns(
    column1: TableColumn,
    column2: TableColumn
  ): boolean {
    return !!column1 && !!column2 && column1.field === column2.field;
  }

}

import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ContentChild,
  Directive,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core';

import {
  MatCellDef,
  MatColumnDef,
  MatHeaderCellDef,
  MatTable
} from '@angular/material/table';

import { Observable, map, switchMap, filter, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { TABLE_SETTINGS_SOURCE } from '../table/table-settings-source.token';
import { TableSettingsSource} from '../table/table-settings-source';
import { ColumnMeta } from './column-meta';
import { TableColumnSetting } from '../table/table-column-setting';

export type TableColumn = {

  /**
   * Name of the field in the data source
   */
  field: string;

  /**
   * Caption for the column header
   */
  label?: string;

  /**
   * User-defined alias for the column
   */
  alias?: string;

  /**
   * Column rendering type
   */
  type?: TableColumnType;

  /**
   * Column width in UI
   */
  width?: string;

  /**
   * Read-only column
   */
  readonly?: boolean;

  /**
   * Indicates if the column can be queried from the backend
   */
  queryable?: boolean;

  /**
   * Column supports grouping
   */
  groupable?: boolean;

  /**
   * UI-only column (not part of dataset)
   */
  computed?: boolean;

  /**
   * Column required for table operation
   */
  required?: boolean;

  /**
   * Column hidden in UI
   */
  hidden?: boolean;

  /**
   * Sorting capability
   */
  sortable?: boolean;

  /**
   * Filtering capability
   */
  filterable?: boolean;

};

export type TableColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'date'
  | 'custom';

@Directive({
  selector: '[matflowTableColumn]',
  exportAs: 'matflowTableColumn',
  standalone: false
})
export class TableColumnDirective <T>  implements OnInit, OnDestroy {

  /**
   * Column label
   */
  @Input('matflowTableColumn')
  label?: string;

  /**
   * Column name (MatColumnDef name)
   */
  @Input()
  name?: string;

  /**
   * Column visible only in UI (not editable)
   */
  private _computed = false;

  @Input()
  set computed(value: BooleanInput) {
    this._computed = coerceBooleanProperty(value);
  }
  get computed(): boolean {
    return this._computed;
  }

  /**
   * Column hidden state
   */
  private _hidden = false;

  @Input()
  set hidden(value: BooleanInput) {
    this._hidden = coerceBooleanProperty(value);
  }
  get hidden(): boolean {
    return this._hidden;
  }

  /**
   * Required column
   */
  private _required = false;

  @Input()
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
  }
  get required(): boolean {
    return this._required;
  }

  /**
   * Column supports grouping
   */
  private _groupable = false;

  @Input()
  set groupable(value: BooleanInput) {
    this._groupable = coerceBooleanProperty(value);
  }
  get groupable(): boolean {
    return this._groupable;
  }

  /**
   * Column queryable from backend
   */
  private _queryable = true;

  @Input()
  set queryable(value: BooleanInput) {
    this._queryable = coerceBooleanProperty(value);
  }
  get queryable(): boolean {
    return this._queryable;
  }

  /**
   * Angular Material cell templates
   */
  @ContentChild(MatCellDef, { static: true })
  cellDef!: MatCellDef;

  @ContentChild(MatHeaderCellDef, { static: true })
  headerCellDef!: MatHeaderCellDef;

  /**
   * Reactive alias from user settings
   */
  alias$!: Observable<string | undefined>;

  /**
   * Final display name
   */
  displayName$!: Observable<string>;

  constructor(
    @Optional() private matColumnDef: MatColumnDef,
    @Optional() private matTable: MatTable<T>,
    @Optional()
    @Inject(TABLE_SETTINGS_SOURCE)
    private tableSettingsSource?: TableSettingsSource
  ) {}

  ngOnInit(): void {

    if (this.matColumnDef && this.name) {
      this.matColumnDef.name = this.name;
    }

    if (this.matColumnDef) {
      this.matColumnDef.cell = this.cellDef;
      this.matColumnDef.headerCell = this.headerCellDef;
    }

    // if (this.matTable && this.matColumnDef) {
    //   this.matTable.addColumnDef(this.matColumnDef);
    // }

    this.init();
  }

  private init(): void {

    if (!this.tableSettingsSource) {
      this.alias$ = of(undefined);
      this.displayName$ = of(this.label || this.matColumnDef?.name || '');
      return;
    }

    this.alias$ = this.tableSettingsSource.loaded$?.pipe(
      filter(loaded => loaded !== undefined),
      // TODO type casting problem
      switchMap(() => this.tableSettingsSource!.tableColumnSettings$ ?? of([])),
      map((settings: TableColumnSetting[]) => {
        const column = settings?.find(
          s => s.name === this.matColumnDef?.name
        );
        return column?.alias;
      }),
      shareReplay(1)
    ) ?? of(undefined);

    this.displayName$ = this.alias$.pipe(
      map(alias =>
        alias ||
        this.label ||
        this.matColumnDef?.name ||
        ''
      ),
      shareReplay(1)
    );
  }

  /**
   * Column metadata for registry / plugins
   */
  get meta(): ColumnMeta {

    return {
      name: this.matColumnDef?.name || '',
      label: this.label,

      hidden: this.hidden,
      viewonly: this.computed,
      required: this.required,

      queryable: this.queryable,
      groupable: this.groupable
    };
  }

  ngOnDestroy(): void {
    // if (this.matTable && this.matColumnDef) {
    //   this.matTable.removeColumnDef(this.matColumnDef);
    // }
  }
}

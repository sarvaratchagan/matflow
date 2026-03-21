import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ContentChild,
  Directive, Host,
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

import { Observable, map, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ColumnMeta } from './column-meta';
import { MatflowTableDirective } from '../table/matflow-table';

/**
 * Runtime representation of a table column.
 *
 * Combines:
 * - Structural info (field, label)
 * - UI capabilities (sortable, filterable)
 * - Behavioral flags (computed, required, hidden)
 */
export type TableColumn = {

  /** Field name in the data source */
  field: string;

  /** Default display label */
  label?: string;

  /** User-defined alias (overrides label) */
  alias?: string;

  /** Rendering type of column */
  type?: TableColumnType;

  /** Column width (CSS value) */
  width?: string;

  /** Indicates read-only column */
  readonly?: boolean;

  /** Column can be queried from backend */
  queryable?: boolean;

  /** Column supports grouping */
  groupable?: boolean;

  /** Column is computed (not part of raw dataset) */
  computed?: boolean;

  /** Column is mandatory (cannot be removed) */
  required?: boolean;

  /** Column is hidden by default */
  hidden?: boolean;

  /** Supports sorting */
  sortable?: boolean;

  /** Supports filtering */
  filterable?: boolean;

};

/**
 * Supported column rendering types.
 */
export type TableColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'date'
  | 'custom';

/**
 * Directive that bridges Angular Material column definitions
 * with Matflow table system.
 *
 * Responsibilities:
 * - Registers column with Angular Material (MatColumnDef)
 * - Provides metadata for Matflow framework
 * - Resolves alias/display name reactively
 */
@Directive({
  selector: '[matflowTableColumn]',
  exportAs: 'matflowTableColumn',
  standalone: false
})
export class TableColumnDirective <T>  implements OnInit, OnDestroy {

  /**
   * Column label (default display name)
   */
  @Input('matflowTableColumn')
  label?: string;

  /**
   * Column name (maps to MatColumnDef.name)
   */
  @Input()
  name?: string;

  /**
   * Indicates column is computed (UI-only)
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
   * Indicates column is hidden
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
   * Indicates column is required (cannot be removed)
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
   * Indicates column supports grouping
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
   * Indicates column is queryable
   *
   * Default: true
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
   * Angular Material cell template reference
   */
  @ContentChild(MatCellDef, { static: true })
  cellDef!: MatCellDef;

  /**
   * Angular Material header template reference
   */
  @ContentChild(MatHeaderCellDef, { static: true })
  headerCellDef!: MatHeaderCellDef;

  /**
   * Reactive stream of alias (from user settings)
   */
  alias$!: Observable<string | undefined>;

  /**
   * Final display name (alias > label > name)
   */
  displayName$!: Observable<string>;

  constructor(
    /** Angular Material column definition */
    @Optional() private matColumnDef: MatColumnDef,

    /** Parent Material table */
    @Optional() private matTable: MatTable<T>,

    /** Parent Matflow table directive */
    @Optional()
    @Host() private matflowTable: MatflowTableDirective
  ) {}

  /**
   * Lifecycle hook: initializes column registration and reactive streams
   */
  ngOnInit(): void {

    // Assign column name to MatColumnDef
    if (this.matColumnDef && this.name) {
      this.matColumnDef.name = this.name;
    }

    // Bind templates to MatColumnDef
    if (this.matColumnDef) {
      this.matColumnDef.cell = this.cellDef;
      this.matColumnDef.headerCell = this.headerCellDef;
    }

    this.init();
  }

  /**
   * Initializes reactive alias + display name resolution
   */
  private init(): void {

    // If not inside matflowTable → fallback behavior
    if (!this.matflowTable) {
      this.alias$ = of(undefined);
      this.displayName$ = of(this.label || this.matColumnDef?.name || '');
      return;
    }

    /**
     * Resolve alias from persisted settings
     */
    this.alias$ = this.matflowTable?.facade?.tableColumnSettings$?.pipe(
      map(columns => {
        if (!columns) return undefined;

        const col = columns.find(
          c => c.name === this.matColumnDef?.name
        );

        return col?.alias;
      }),
      shareReplay(1)
    );

    /**
     * Resolve final display name:
     * priority → alias > label > column name
     */
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
   * Exposes column metadata for:
   * - Registry systems
   * - Plugins (filtering, grouping, etc.)
   */
  get meta(): ColumnMeta {

    return {
      name: this.matColumnDef?.name || '',
      label: this.label,

      hidden: this.hidden,
      computed: this.computed,
      required: this.required,

      queryable: this.queryable,
      groupable: this.groupable
    };
  }

  /**
   * Cleanup hook
   */
  ngOnDestroy(): void {
    // Optional cleanup if dynamic column removal is needed
    // if (this.matTable && this.matColumnDef) {
    //   this.matTable.removeColumnDef(this.matColumnDef);
    // }
  }
}

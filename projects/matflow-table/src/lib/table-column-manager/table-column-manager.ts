import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Host,
  Input, OnInit, Optional,
  Output, SkipSelf
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  map,
  startWith,
  switchAll
} from 'rxjs';
import { TableColumn } from '../table-column/table-column';
import { MatflowTableDirective } from '../table/matflow-table';

/**
 * Mode of column form UI
 * - columnSelector: selecting column
 * - labelEditor: editing alias/label
 */
export type FormMode = 'columnSelector' | 'labelEditor';

/**
 * Strongly typed form structure for a column
 */
export type TableColumnFormGroupType = {
  tableColumn: FormControl<TableColumn | null>;
  alias: FormControl<string | null>;
  mode: FormControl<FormMode>;
  viewonly: FormControl<boolean>;
  groupable: FormControl<boolean>;
  required: FormControl<boolean>;
};

/**
 * Typed FormGroup wrapper
 */
export type TableColumnFormGroup = FormGroup<TableColumnFormGroupType>;

/**
 * Component responsible for managing a single column entry
 * inside TableColumnsManager
 */
@Component({
  selector: 'matflow-table-column-manager',
  templateUrl: './table-column-manager.html',
  styleUrl: './table-column-manager.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnManager implements OnInit {

  /**
   * Emits when user removes this column
   */
  @Output()
  remove = new EventEmitter<FormGroup>();

  /**
   * Holds currently used columns (to avoid duplicates)
   */
  private usedTableColumnsSubject = new ReplaySubject<TableColumn[]>(1);
  usedTableColumns$ = this.usedTableColumnsSubject.asObservable();

  /**
   * Holds current form group instance
   */
  private tableColumnFormGroupSubject =
    new ReplaySubject<TableColumnFormGroup>(1);

  tableColumnFormGroup$ =
    this.tableColumnFormGroupSubject.asObservable();

  /**
   * Input: all currently used columns
   */
  @Input()
  set usedTableColumns(value: TableColumn[]) {
    this.usedTableColumnsSubject.next(value);
  }

  /**
   * Internal reference to form group
   */
  private _tableColumnFormGroup!: TableColumnFormGroup;

  get tableColumnFormGroup(): TableColumnFormGroup {
    return this._tableColumnFormGroup;
  }

  /**
   * Input: form group for this column row
   *
   * Also:
   * - pushes into observable stream
   * - auto-scrolls into view if empty (UX enhancement)
   */
  @Input()
  set tableColumnFormGroup(value: TableColumnFormGroup) {
    this._tableColumnFormGroup = value;
    this.tableColumnFormGroupSubject.next(value);

    // Auto-scroll when a new empty row is added
    if (!value.controls.tableColumn.value) {
      this.elementRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }

  /**
   * Currently selected column (reactive stream)
   *
   * Handles:
   * - initial value
   * - subsequent changes
   */
  readonly selectedTableColumn$: Observable<TableColumn | undefined> =
    this.tableColumnFormGroup$.pipe(
      map(fg => fg.controls.tableColumn),
      map(control =>
        control.valueChanges.pipe(
          startWith(control.value),
          map(v => v ?? undefined)
        )
      ),
      // flatten inner observable stream
      switchAll()
    );

  /**
   * Available columns for selection
   * (filtered dynamically based on usage + selection)
   */
  availableColumns$!: Observable<TableColumn[]>;

  constructor(
    private elementRef: ElementRef<HTMLElement>,

    /**
     * Parent table (SkipSelf ensures correct hierarchy lookup)
     */
    @Optional() @SkipSelf() private table?: MatflowTableDirective
  ) {}

  /**
   * Initialize available columns stream
   */
  ngOnInit() {
    if (this.table?.facade) {
      this.availableColumns$ = combineLatest<[
          TableColumn[] | undefined,
          TableColumn | undefined,
        TableColumn[]
      ]>([
        this.table.facade.availableColumns$,
        this.selectedTableColumn$,
        this.usedTableColumns$
      ]).pipe(
        map(([availableColumns, selectedColumn, usedColumns]): TableColumn[] => {

          if (!availableColumns) return [];

          return availableColumns
            // Allow only queryable or computed columns
            .filter(col => col.queryable || col.computed)

            // Exclude hidden columns
            .filter(col => !col.hidden)

            // Prevent duplicate selection
            .filter(col => {
              // Allow currently selected column
              if (selectedColumn?.field === col.field) return true;

              // Exclude already used columns
              return !usedColumns.some(
                used => used.field === col.field
              );
            })

            // Preserve label overrides if already used
            .map(col => {
              const usedColumn = usedColumns.find(
                used => used.field === col.field
              );

              return {
                ...col,
                label: usedColumn?.label ?? col.label
              };
            });
        })
      );
    }
  }

  /**
   * Switch UI to label editing mode
   */
  edit() {
    this.tableColumnFormGroup.controls.mode.setValue('labelEditor');
  }

  /**
   * Revert alias changes and switch back to selector mode
   */
  undo() {
    this.tableColumnFormGroup.controls.mode.setValue('columnSelector');
    this.tableColumnFormGroup.controls.alias.setValue(null);
  }

  /**
   * Comparator for dropdown selection
   * (prevents object reference issues)
   */
  compareTableColumns(
    column1: TableColumn,
    column2: TableColumn
  ): boolean {
    return !!column1 && !!column2 && column1.field === column2.field;
  }

}

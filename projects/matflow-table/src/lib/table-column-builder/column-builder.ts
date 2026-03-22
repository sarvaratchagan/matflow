import { TableColumn, TableColumnType } from '../table-column/table-column';

/**
 * Fluent builder for creating TableColumn configurations.
 *
 * Benefits:
 * - Improves readability when defining columns
 * - Provides chainable API
 * - Avoids repetitive object construction
 *
 * Example:
 * new ColumnBuilder('price')
 *   .label('Price')
 *   .currency()
 *   .sortable()
 *   .build();
 */
export class ColumnBuilder {

  /**
   * Internal mutable column object being constructed
   */
  private column: TableColumn;

  /**
   * Initializes builder with required field name
   *
   * @param field Unique column identifier (maps to data source)
   */
  constructor(field: string) {
    this.column = {
      field
    };
  }

  /**
   * Sets display label for the column
   */
  label(value: string) {
    this.column.label = value;
    return this;
  }

  /**
   * Enables/disables sorting
   *
   * Default: true
   */
  sortable(enabled = true) {
    this.column.sortable = enabled;
    return this;
  }

  /**
   * Enables/disables filtering
   *
   * Default: true
   */
  filterable(enabled = true) {
    this.column.filterable = enabled;
    return this;
  }

  /**
   * Enables/disables grouping
   *
   * Default: true
   */
  groupable(enabled = true) {
    this.column.groupable = enabled;
    return this;
  }

  /**
   * Sets column width (CSS value)
   *
   * Example:
   * - '100px'
   * - '20%'
   */
  width(value: string) {
    this.column.width = value;
    return this;
  }

  /**
   * Sets column type explicitly
   */
  type(value: TableColumnType) {
    this.column.type = value;
    return this;
  }

  /**
   * Shortcut for currency type
   */
  currency() {
    this.column.type = 'currency';
    return this;
  }

  /**
   * Shortcut for number type
   */
  number() {
    this.column.type = 'number';
    return this;
  }

  /**
   * Shortcut for boolean type
   */
  boolean() {
    this.column.type = 'boolean';
    return this;
  }

  /**
   * Finalizes and returns the constructed column
   *
   * Note:
   * - Returns the same object reference (not immutable)
   */
  build(): TableColumn {
    return this.column;
  }
}

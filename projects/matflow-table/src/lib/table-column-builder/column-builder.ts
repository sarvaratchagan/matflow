import { TableColumn, TableColumnType } from '../table-column/table-column';

export class ColumnBuilder {

  private column: TableColumn;

  constructor(field: string) {
    this.column = {
      field
    };
  }

  label(value: string) {
    this.column.label = value;
    return this;
  }

  sortable(enabled = true) {
    this.column.sortable = enabled;
    return this;
  }

  filterable(enabled = true) {
    this.column.filterable = enabled;
    return this;
  }

  groupable(enabled = true) {
    this.column.groupable = enabled;
    return this;
  }

  width(value: string) {
    this.column.width = value;
    return this;
  }

  type(value: TableColumnType) {
    this.column.type = value;
    return this;
  }

  currency() {
    this.column.type = 'currency';
    return this;
  }

  number() {
    this.column.type = 'number';
    return this;
  }

  boolean() {
    this.column.type = 'boolean';
    return this;
  }

  build(): TableColumn {
    return this.column;
  }
}

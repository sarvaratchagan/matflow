export interface ColumnMeta {
  name: string;
  label?: string;

  hidden: boolean;
  viewonly: boolean;
  required: boolean;

  queryable: boolean;
  groupable: boolean;
}

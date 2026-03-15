import { TableColumn } from 'matflow-table';

export function resolveDisplayedColumns(
  displayedColumns: string[],
  availableColumns: TableColumn[],
  defaultColumns: string[]
): string[] {

  return (
    availableColumns
      ?.filter(column =>
        (
          (
            (displayedColumns || defaultColumns)
              ?.includes(column?.field) &&
            column?.queryable
          ) ||
          column?.hidden ||
          column?.required
        )
      )
      ?.map(col => col.field) ?? []
  );

}

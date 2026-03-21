/**
 * Represents persisted/user-defined configuration for a table column.
 *
 * This model is typically stored via an adapter (e.g., LocalStorage, API)
 * and used to reconstruct the table state (order, visibility, labels).
 */
export type TableColumnSetting = {

  /**
   * Defines the position of the column in the table.
   *
   * Lower numbers appear first.
   * Used for sorting columns before rendering.
   */
  order: number;

  /**
   * Unique identifier of the column.
   *
   * Should match:
   * - TableColumn.field
   * - ColumnMeta.name
   */
  name: string;

  /**
   * Optional custom label defined by the user.
   *
   * Overrides:
   * - TableColumn.label
   * - ColumnMeta.label
   */
  alias?: string;

  /**
   * Controls visibility of the column.
   *
   * true  → column is visible
   * false → column is hidden
   *
   * Note:
   * If undefined, fallback logic may apply (e.g., default columns).
   */
  displayed?: boolean;
};

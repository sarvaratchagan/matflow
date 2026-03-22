/**
 * Metadata definition for a table column.
 *
 * This model describes the capabilities and behavior of a column
 * independent of UI rendering.
 *
 * It is typically used for:
 * - Dynamic table configuration
 * - Query building (filters, grouping)
 * - Column visibility and constraints
 */
export interface ColumnMeta {

  /**
   * Unique identifier for the column.
   * Should match the `field` used in TableColumn.
   */
  name: string;

  /**
   * Optional display label for the column.
   * Used in UI (header, menus, etc.).
   */
  label?: string;

  /**
   * Indicates whether the column is hidden by default.
   *
   * Note:
   * This does NOT necessarily mean it cannot be shown.
   * It may still be toggled visible by the user.
   */
  hidden: boolean;

  /**
   * Indicates whether the column is computed/derived.
   *
   * Example:
   * - Full name = firstName + lastName
   * - Calculated totals
   *
   * Typically:
   * - Not directly queryable from backend
   * - May require client-side computation
   */
  computed: boolean;

  /**
   * Indicates whether the column is mandatory.
   *
   * Behavior:
   * - Cannot be removed from visible columns
   * - Always enforced in UI
   */
  required: boolean;

  /**
   * Indicates whether the column can be used in queries.
   *
   * Example:
   * - Filtering
   * - Searching
   *
   * If false:
   * - Should be excluded from query builders
   */
  queryable: boolean;

  /**
   * Indicates whether the column supports grouping.
   *
   * Example:
   * - Group by status
   * - Group by category
   *
   * If false:
   * - Should be disabled in grouping UI
   */
  groupable: boolean;
}

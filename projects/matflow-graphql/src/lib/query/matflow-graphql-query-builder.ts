import { gql } from 'apollo-angular';
import { DocumentNode } from 'graphql';

/**
 * Recursive field tree
 */
export type MatflowFieldTree<T> = {
  [key: string]: T | MatflowFieldTree<T>;
};

/**
 * Build GraphQL selection
 */
function buildSelection(node: MatflowFieldTree<boolean>): string {

  let result = '';

  for (const key in node) {

    const value = node[key];

    if (typeof value === 'object') {
      result += `${key} { ${buildSelection(value as MatflowFieldTree<boolean>)} } `;
    } else {
      result += `${key} `;
    }

  }

  return result.trim();
}

/**
 * Convert dot paths into GraphQL tree
 */
export function buildFieldTree(fields: string[]): string {

  const tree: MatflowFieldTree<boolean> = {};

  fields.forEach(path => {

    const parts = path.split('.');
    let current = tree;

    parts.forEach((part, index) => {

      if (index === parts.length - 1) {
        current[part] = true;
      } else {
        current[part] = current[part] || {};
        current = current[part] as MatflowFieldTree<boolean>;
      }

    });

  });

  return buildSelection(tree);
}

/**
 * Generate GraphQL query
 */
export function buildMatflowGraphqlQuery(
  columns: string[],
  template: string
): DocumentNode {

  const fields = buildFieldTree(
    columns.filter(col => col !== 'actions')
  );

  const query = (template ?? '').replace(/#fields#/g, fields);

  return gql`${query}`;
}

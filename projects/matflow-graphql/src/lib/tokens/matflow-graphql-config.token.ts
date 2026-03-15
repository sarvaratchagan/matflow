import { InjectionToken } from '@angular/core';

export interface MatflowGraphqlConfig {
  endpoint?: string;
}

export const MATFLOW_GRAPHQL_CONFIG =
  new InjectionToken<MatflowGraphqlConfig>(
    'MATFLOW_GRAPHQL_CONFIG'
  );

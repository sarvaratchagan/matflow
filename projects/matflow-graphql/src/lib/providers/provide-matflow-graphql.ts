import { Provider } from '@angular/core';
import {
  MATFLOW_GRAPHQL_CONFIG,
  MatflowGraphqlConfig
} from '../tokens/matflow-graphql-config.token';

export function provideMatflowGraphql(
  config: MatflowGraphqlConfig
): Provider[] {

  return [
    {
      provide: MATFLOW_GRAPHQL_CONFIG,
      useValue: config
    }
  ];

}

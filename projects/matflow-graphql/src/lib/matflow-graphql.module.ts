import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  MATFLOW_GRAPHQL_CONFIG,
  MatflowGraphqlConfig
} from './tokens/matflow-graphql-config.token';
import { MatflowGraphqlClient } from './client/matflow-graphql-client';

/**
 * Matflow GraphQL Module
 *
 * Provides GraphQL client integration for the Matflow framework.
 *
 * This module is optional and mainly intended for NgModule-based Angular
 * applications. Standalone applications should prefer using
 * `provideMatflowGraphql()` instead.
 *
 * Example (NgModule app):
 *
 * ```ts
 * @NgModule({
 *   imports: [
 *     MatflowGraphqlModule.forRoot({
 *       endpoint: '/graphql'
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * Example (Standalone app):
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     ...provideMatflowGraphql({
 *       endpoint: '/graphql'
 *     })
 *   ]
 * };
 * ```
 */
@NgModule({})
export class MatflowGraphqlModule {

  /**
   * Configure Matflow GraphQL globally
   */
  static forRoot(
    config: MatflowGraphqlConfig
  ): ModuleWithProviders<MatflowGraphqlModule> {

    return {
      ngModule: MatflowGraphqlModule,
      providers: [
        {
          provide: MATFLOW_GRAPHQL_CONFIG,
          useValue: config
        },
        MatflowGraphqlClient
      ]
    };

  }

}

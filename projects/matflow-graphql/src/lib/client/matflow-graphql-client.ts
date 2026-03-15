import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { DocumentNode } from 'graphql';

@Injectable()
export class MatflowGraphqlClient {

  constructor(private apollo: Apollo) {}

  query<T>(
    query: DocumentNode,
    variables?: any
  ): Observable<T> {

    return this.apollo
      .query<T>({
        query,
        variables
      }) as Observable<T>;

  }

  mutate<T>(
    mutation: DocumentNode,
    variables?: any
  ): Observable<T> {

    return this.apollo
      .mutate<T>({
        mutation,
        variables
      }) as Observable<T>;

  }

}

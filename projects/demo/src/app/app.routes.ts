import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users-table',
    pathMatch: 'full'
  },
  {
    path: 'users-table',
    loadComponent: () =>
      import('./users-table/users-table')
        .then(m => m.UsersTableComponent)
  },
  // {
  //   path: 'computed-columns',
  //   loadComponent: () =>
  //     import('./examples/computed-columns/computed-columns.component')
  //       .then(m => m.ComputedColumnsComponent)
  // },
  //
  // {
  //   path: 'column-alias',
  //   loadComponent: () =>
  //     import('./examples/column-alias/column-alias.component')
  //       .then(m => m.ColumnAliasComponent)
  // },
  {
    path: 'popover-example',
    loadComponent: () =>
      import('./popover-example/popover-example')
        .then(m => m.PopoverExample)
  }
];

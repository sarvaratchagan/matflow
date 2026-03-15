import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TableColumnDirective } from './table-column/table-column';
import { TableDirective } from './table/table';
import { TableColumnsDirective } from './table-columns/table-columns.directive';

@NgModule({
  declarations: [
    TableColumnDirective,
    TableColumnsDirective,
    TableDirective
  ],
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  exports: [
    TableColumnDirective,
    TableColumnsDirective,
    TableDirective
  ]
})
export class MatflowTableModule {}

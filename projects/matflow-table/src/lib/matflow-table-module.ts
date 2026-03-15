import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TableColumnDirective } from './table-column/table-column';
import { MatflowTableSettings, TableDirective } from './table/table';
import { TableColumnsDirective } from './table-columns/table-columns.directive';
import { TABLE_SETTINGS_SOURCE } from './table/table-settings-source.token';

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
  ],
  providers: [
    {
      provide: TABLE_SETTINGS_SOURCE,
      useClass: MatflowTableSettings
    }
  ]
})
export class MatflowTableModule {}

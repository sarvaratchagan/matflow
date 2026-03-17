import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PortalModule } from '@angular/cdk/portal';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { TableColumnDirective } from './table-column/table-column';
import { MatflowTableSettings, TableDirective } from './table/table';
import { TableColumnsDirective } from './table-columns/table-columns.directive';
import { TABLE_SETTINGS_SOURCE } from './table/table-settings-source.token';
import { TableColumnManager } from './table-column-manager/table-column-manager';
import { TableColumnsManager } from './table-columns-manager/table-columns-manager';

@NgModule({
  declarations: [
    TableColumnDirective,
    TableColumnsDirective,
    TableDirective,
    TableColumnManager,
    TableColumnsManager
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    PortalModule,
    ScrollingModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatDividerModule
  ],
  exports: [
    TableColumnDirective,
    TableColumnsDirective,
    TableDirective,
    TableColumnManager,
    TableColumnsManager
  ],
  providers: [
    {
      provide: TABLE_SETTINGS_SOURCE,
      useClass: MatflowTableSettings
    }
  ]
})
export class MatflowTableModule {}

import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { UserTableSettingsAdapter} from './user-table-settings-adapter';
import { MatflowTableModule, TABLE_COLUMN_SETTINGS_ADAPTER } from 'matflow-table';

export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.html',
  styleUrl: './users-table.scss',
  providers: [
    {
      provide: TABLE_COLUMN_SETTINGS_ADAPTER,
      useClass: UserTableSettingsAdapter
    }
  ],
  imports: [
    MatflowTableModule,
    MatTableModule
  ],
  standalone: true
})
export class UsersTableComponent {

  displayedColumns = ['id', 'name', 'email', 'active'];

  data: User[] = [
    { id: 1, name: 'John', email: 'john@mail.com', active: true },
    { id: 2, name: 'Jane', email: 'jane@mail.com', active: false },
    { id: 3, name: 'Alex', email: 'alex@mail.com', active: true }
  ];
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { UserTableSettingsAdapter} from './user-table-settings-adapter';
import { MatflowTableModule, TABLE_COLUMN_SETTINGS_ADAPTER } from 'matflow-table';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  country: string;
  createdAt: Date;
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
    CommonModule,
    MatflowTableModule,
    MatTableModule
  ],
  standalone: true
})
export class UsersTableComponent implements OnInit {

  displayedColumns = ['id', 'name', 'email', 'role', 'department', 'country' , 'status', 'createdAt'];

  data: User[] = [];

  ngOnInit() {
    this.data = this.generateUsers(10000);
  }

  generateUsers(count: number): User[] {

    const roles = ['Admin', 'Manager', 'User', 'Viewer'];
    const departments = ['Engineering', 'Finance', 'HR', 'Marketing', 'Sales'];
    const countries = ['USA', 'India', 'Germany', 'UK', 'Canada', 'Australia'];
    const status = ['Active', 'Pending', 'Disabled'];

    return Array.from({length: count}).map((_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@demo.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      status: status[Math.floor(Math.random() * status.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      createdAt: new Date(
        2020 + Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28)
      )
    }));
  }
}

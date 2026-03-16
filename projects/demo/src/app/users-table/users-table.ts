import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { UserTableSettingsAdapter} from './user-table-settings-adapter';
import { MatflowTableModule, TABLE_COLUMN_SETTINGS_ADAPTER, TableDirective, TableColumn } from 'matflow-table';
import { ReplaySubject, combineLatest, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

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
export class UsersTableComponent implements OnInit, AfterViewInit {

  @ViewChild(TableDirective)
  usersTable!: TableDirective;

  availableColumnsSubject = new ReplaySubject<TableColumn[]>(1);
  availableColumns$ = this.availableColumnsSubject.asObservable();

  displayedColumns$!: Observable<string[]>;

  defaultColumns = ['id', 'name', 'email', 'role', 'department'];

  data: User[] = [];

  ngOnInit() {
    this.data = this.generateUsers(10000);
  }

  ngAfterViewInit() {
    const displayedColumns$: Observable<(string | undefined)[]> = this.usersTable.displayedColumns$?.pipe(
      filter(columns => !!columns)
    );
    this.displayedColumns$ = combineLatest([
      this.availableColumns$,
      displayedColumns$
    ])?.pipe(
      map(([availableColumns, displayedColumns]: [TableColumn[], (string | undefined)[]]) => {
        return (
          availableColumns
            ?.filter(column =>
              (displayedColumns || this.defaultColumns)
                ?.includes(column?.field)
            )
            ?.map(col => col.field) ?? []
        )
      })
    );
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

# Matflow Table

![Angular](https://img.shields.io/badge/Angular-v21-red)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A highly extensible, declarative, and reactive table abstraction built on top of Angular Material.

# ✨ Why Matflow Table?

Matflow Table is designed to solve common problems in enterprise Angular apps:

- ❌ Boilerplate-heavy table setup
- ❌ Tight coupling between UI & state
- ❌ Hard-to-maintain column logic
- ❌ Poor extensibility

✅ **Solution:** A declarative, adapter-driven, reactive architecture.

---

# 🚀 Features

- 🧱 Declarative column definitions
- 🔌 Pluggable persistence (local / API / GraphQL)
- 🔄 Fully reactive (RxJS-powered)
- 🧩 Adapter-based extensibility
- 📊 Dynamic columns & visibility control
- 📂 Column persistence (save/load)
- 🧠 directive auto-wiring
- 🎨 Custom templates support

---

# ⚡ Quick Start

## Install

```bash
npm install @matflow/table
```

## Import Module

```ts
import { MatflowTableModule } from 'matflow-table';

@NgModule({
  imports: [MatflowTableModule]
})
export class AppModule {}
```

---

## 1. Basic table

```html
<ng-container
    #userTable="matflowTable"
    [defaultColumns]="defaultColumns"
    matflowTable="users-table">
    <table
        mat-table
        [dataSource]="data">
        <ng-container
                matflowTableColumns
                (matflowTableColumnsChange)="availableColumnsSubject.next($event)">
            <ng-container
                    matColumnDef="id"
                    matflowTableColumn="ID"
                    #idColumn="matflowTableColumn"
                    name="id"
                    queryable
                    required>

                <th mat-header-cell *matHeaderCellDef>
                    {{idColumn?.displayName$ | async}}
                </th>
                <td mat-cell *matCellDef="let row">
                    {{ row.id }}
                </td>

            </ng-container>
            
            <ng-container
                    matColumnDef="name"
                    matflowTableColumn="Name"
                    #nameColumn="matflowTableColumn"
                    name="name"
                    queryable
                    groupable>
                <th mat-header-cell *matHeaderCellDef>
                    {{nameColumn?.displayName$ | async}}
                </th>
                <td mat-cell *matCellDef="let row">
                    {{ row.name }}
                </td>
            </ng-container>

        </ng-container>

        <tr mat-header-row
            *matHeaderRowDef="(userTable?.displayedColumns$ | async); sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: (userTable?.displayedColumns$ | async)"></tr>

    </table>
</ng-container>
```
```typescript

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { UserTableSettingsAdapter} from './user-table-settings-adapter';
import { MatflowTableModule, TABLE_COLUMN_SETTINGS_ADAPTER, MatflowTableDirective, TableColumn } from 'matflow-table';
import { ReplaySubject, combineLatest, Observable, tap } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  // extend based on your requirements
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
    MatTableModule,
    DragDropModule
  ],
  standalone: true
})
export class UsersTableComponent implements OnInit, AfterViewInit {

  @ViewChild(MatflowTableDirective)
  usersTable!: MatflowTableDirective;

  availableColumnsSubject = new ReplaySubject<TableColumn[]>(1);
  availableColumns$ = this.availableColumnsSubject.asObservable();

  displayedColumns$!: Observable<string[]>;

  defaultColumns = ['id', 'name'];

  data: User[] = [];

  ngOnInit() {
    this.data = this.generateUsers(1000);
  }

  ngAfterViewInit() {
    const displayedColumns$: Observable<(string | undefined)[]> = this.usersTable.displayedColumns$?.pipe(
      filter(columns => !!columns),
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
    return Array.from({length: count}).map((_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
    }));
  }
}
```

---

## 2. Adapter Layer (Extensibility Core)

```ts
export abstract class TableColumnSettingsAdapter {
  abstract load(): Observable<ColumnConfig[]>;
  abstract save(config: ColumnConfig[]): Observable<void>;
}
```

```typescript
import { Injectable } from '@angular/core';
import { TableColumnSettingsAdapter, TableColumnSetting } from 'matflow-table';
import { Observable, of } from 'rxjs';

@Injectable()
export class UserTableSettingsAdapter
    implements TableColumnSettingsAdapter {

    private prefix = 'matflow-table-settings';

    load(
        tableName: string
    ): Observable<TableColumnSetting[] | null> {

        const key = `${this.prefix}-${tableName}`;
        const raw = localStorage.getItem(key);

        if (!raw) {
            return of(null);
        }

        try {
            return of(JSON.parse(raw) as TableColumnSetting[]);
        } catch {
            return of(null);
        }
    }

    save(
        tableName: string,
        columns: TableColumnSetting[] | null
    ): Observable<TableColumnSetting[] | null> {

        const key = `${this.prefix}-${tableName}`;

        localStorage.setItem(
            key,
            JSON.stringify(columns)
        );

        return of(columns);
    }
}

```

👉 Plug your own implementation:
- LocalStorage
- REST API
- GraphQL

---

## 3. Column re-ordering

```html
<ng-container
        #userTable="matflowTable"
        [defaultColumns]="defaultColumns"
        matflowColumnReorder
        matflowTable="users-table">
    
    <table
            mat-table
            [dataSource]="data"
            cdkDropList
            [cdkDropListData]="userTable.displayedTableColumns$ | async"
            cdkDropListOrientation="horizontal"
            matflowColumnReorderList>

        <ng-container
                matflowTableColumns
                (matflowTableColumnsChange)="availableColumnsSubject.next($event)">
            <!-- ID -->
            <ng-container
                    matColumnDef="id"
                    matflowTableColumn="ID"
                    #idColumn="matflowTableColumn"
                    name="id"
                    queryable
                    required>

                <th mat-header-cell *matHeaderCellDef cdkDrag>
                    {{idColumn?.displayName$ | async}}
                    <span cdkDragHandle>☰</span>

                    <div *cdkDragPreview>
                        {{idColumn?.displayName$ | async}}
                    </div>
                </th>
                <td mat-cell *matCellDef="let row">
                    {{ row.id }}
                </td>

            </ng-container>

            <!-- Name -->
            <ng-container
                    matColumnDef="name"
                    matflowTableColumn="Name"
                    #nameColumn="matflowTableColumn"
                    name="name"
                    queryable
                    groupable>
                <th mat-header-cell *matHeaderCellDef cdkDrag>
                    {{nameColumn?.displayName$ | async}}
                    <span cdkDragHandle>☰</span>

                    <div *cdkDragPreview>
                        {{nameColumn?.displayName$ | async}}
                    </div>
                </th>
                <td mat-cell *matCellDef="let row">
                    {{ row.name }}
                </td>
            </ng-container>
        </ng-container>

        <tr mat-header-row
            *matHeaderRowDef="(userTable?.displayedColumns$ | async); sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: (userTable?.displayedColumns$ | async)"></tr>

    </table>
</ng-container>
```
---

## 4. Column manager
```html
    <matflow-table-columns-manager></matflow-table-columns-manager>
```
place this component inside your table wherever you need. all css styles needs to be managed from your end

## 5. Reactive State Layer

```ts
availableColumns$ = this.facade.availableColumns$;
```

Everything is observable:
- columns
- visibility
- ordering
- state

---

# 🧪 Development

## Run App

```bash
npm start
```

## Watch Table Module

```bash
npm run watch:table
```

## Test

```bash
npm test
```

## Lint

```bash
npm run lint
```

---

# 🔮 Future Enhancements

- Virtual scrolling (CDK)
- Table Grouping
- Plugin ecosystem
- Inline table editor

---

# 🤝 Contributing

PRs are welcome. Please ensure:

- Code is linted
- Tests pass
- APIs are documented

---

# 📄 License

MIT License

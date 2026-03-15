# Matflow

Matflow is a **modern, extensible Angular UI framework** built on top of
**Angular CDK** and **Angular Material**.

The project provides flexible and composable building blocks such as
**overlays, tables, and graphql utilities** designed for scalable
Angular applications and enterprise UI systems.

Matflow focuses on **extensibility, composability, and modern Angular
architecture**, allowing developers to build advanced UI systems while
maintaining performance and developer productivity.

------------------------------------------------------------------------

# ✨ Features

-   Built on **Angular CDK**
-   Compatible with **Angular 17+ / 18 / 19 / 20 / 21**
-   **Standalone-first architecture**
-   Flexible **Overlay system**
-   Extensible **Table framework**
-   **Plugin based architecture**
-   Fully **TypeScript typed APIs**
-   Lightweight and **tree‑shakeable**
-   Designed for **enterprise Angular applications**

------------------------------------------------------------------------

# 🧠 Design Philosophy

Matflow follows several core design principles.

### Extensibility First

Components are designed to be extended through directives, configuration
objects, and plugin systems.

### Composable Primitives

Matflow provides flexible UI primitives instead of rigid components.

### CDK Powered

Core infrastructure is built using **Angular CDK** to ensure stability,
accessibility, and performance.

### Modern Angular

Matflow embraces modern Angular features including:

-   Standalone APIs
-   Typed templates
-   Modern control flow (`@if`, `@for`)
-   Directive composition patterns

------------------------------------------------------------------------

# 📦 Installation

Install Angular dependencies if not already installed:

``` bash
npm install @angular/cdk @angular/material
```

Install Matflow packages (once published):

``` bash
npm install matflow
```

------------------------------------------------------------------------

# 🚀 Development Server

To start the demo application locally:

``` bash
ng serve
```

Once the server is running, open:

    http://localhost:4200/

The application will automatically reload whenever you modify any source
files.

------------------------------------------------------------------------

# 📌 Popover Example

Matflow includes a flexible **CDK-based popover system**.

``` html
<button
  #trigger="matflowPopoverTrigger"
  [matflowPopoverTriggerFor]="popover"
  (click)="trigger.toggle()">
  Open Popover
</button>

<ng-template matflowPopover #popover="matflowPopover">
  <div class="popover-panel">
    Hello from Matflow 🎉
  </div>
</ng-template>
```

------------------------------------------------------------------------

# 📌 Table Example

Matflow includes a flexible **declarative table system**.

``` html
<table
  mat-table
  [dataSource]="data"
  matflowTable>

  <ng-container matflowTableColumns>
    <!-- ID -->
    <ng-container
      matColumnDef="id"
      matflowTableColumn="ID"
      name="id"
      queryable
      required>

      <th mat-header-cell *matHeaderCellDef>ID</th>
      <td mat-cell *matCellDef="let row">
        {{ row.id }}
      </td>

    </ng-container>


    <!-- Name -->
    <ng-container
      matColumnDef="name"
      matflowTableColumn="Name"
      name="name"
      queryable
      groupable>

      <th mat-header-cell *matHeaderCellDef>Name</th>
      <td mat-cell *matCellDef="let row">
        {{ row.name }}
      </td>

    </ng-container>


    <!-- Email -->
    <ng-container
      matColumnDef="email"
      matflowTableColumn="Email"
      name="email"
      queryable>

      <th mat-header-cell *matHeaderCellDef>Email</th>
      <td mat-cell *matCellDef="let row">
        {{ row.email }}
      </td>

    </ng-container>


    <!-- Active -->
    <ng-container
      matColumnDef="active"
      matflowTableColumn="Active"
      name="active">

      <th mat-header-cell *matHeaderCellDef>Active</th>
      <td mat-cell *matCellDef="let row">
        {{ row.active }}
      </td>

    </ng-container>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

</table>

```

------------------------------------------------------------------------


# 🧱 Core Modules

Matflow is designed as a **modular framework**.

  Module    Description
  --------- ------------------------------------
  Overlay   Core overlay infrastructure
  Popover   Contextual popover system
  Table     Smart table framework
  Grid      Advanced grid utilities
  Core      Shared utilities and internal APIs

------------------------------------------------------------------------

# 🏗 Project Structure

    projects
    │
    ├ matflow-overlay
    │   └ popover system
    │
    ├ matflow-table
    │   └ table framework
    │
    ├ matflow-graphql
    │   └ advanced graphql utilities
    │
    └ demo
        └ demo application

------------------------------------------------------------------------

# 🛠 Code Scaffolding

Angular CLI includes powerful scaffolding tools.

Generate a component:

``` bash
ng generate component component-name
```

List all schematics:

``` bash
ng generate --help
```

------------------------------------------------------------------------

# 🏗 Building

Build the project using:

``` bash
ng build
```

The compiled artifacts will be stored in the:

    dist/

directory.

------------------------------------------------------------------------

# 🧪 Running Unit Tests

Execute unit tests with **Vitest**:

``` bash
ng test
```

------------------------------------------------------------------------

# 🔍 End-to-End Testing

Run end-to-end tests using:

``` bash
ng e2e
```

Angular CLI does not include an E2E framework by default, so you can
integrate tools like:

-   Playwright
-   Cypress
-   WebdriverIO

------------------------------------------------------------------------

# 📌 Roadmap

Planned features include:

-   Advanced overlay positioning
-   Table framework
-   Column builder system
-   Table plugin architecture
-   Sorting and filtering plugins
-   Pagination plugins
-   Virtualized data rendering
-   GraphQL integration utilities

------------------------------------------------------------------------

# 🤝 Contributing

Contributions are welcome.

1.  Fork the repository
2.  Create a feature branch
3.  Commit your changes
4.  Submit a pull request

------------------------------------------------------------------------

# 📄 License

MIT License

------------------------------------------------------------------------

# ⭐ Support

If you find Matflow useful, please consider **starring the repository**.

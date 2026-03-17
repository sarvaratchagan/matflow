import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableColumnManager } from './table-column-manager';

describe('TableColumnManager', () => {
  let component: TableColumnManager;
  let fixture: ComponentFixture<TableColumnManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableColumnManager],
    }).compileComponents();

    fixture = TestBed.createComponent(TableColumnManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

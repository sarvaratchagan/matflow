import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableColumnsManager } from './table-columns-manager';

describe('TableColumnsManager', () => {
  let component: TableColumnsManager;
  let fixture: ComponentFixture<TableColumnsManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableColumnsManager],
    }).compileComponents();

    fixture = TestBed.createComponent(TableColumnsManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

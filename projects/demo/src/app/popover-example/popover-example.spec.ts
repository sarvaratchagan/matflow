import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverExample } from './popover-example';

describe('PopoverExample', () => {
  let component: PopoverExample;
  let fixture: ComponentFixture<PopoverExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverExample],
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverExample);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

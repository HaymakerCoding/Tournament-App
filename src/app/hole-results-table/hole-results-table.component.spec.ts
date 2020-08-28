import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoleResultsTableComponent } from './hole-results-table.component';

describe('HoleResultsTableComponent', () => {
  let component: HoleResultsTableComponent;
  let fixture: ComponentFixture<HoleResultsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoleResultsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoleResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

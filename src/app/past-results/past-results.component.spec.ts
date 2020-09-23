import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastResultsComponent } from './past-results.component';

describe('PastResultsComponent', () => {
  let component: PastResultsComponent;
  let fixture: ComponentFixture<PastResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

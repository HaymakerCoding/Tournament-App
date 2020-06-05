import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCompetitorsComponent } from './all-competitors.component';

describe('AllCompetitorsComponent', () => {
  let component: AllCompetitorsComponent;
  let fixture: ComponentFixture<AllCompetitorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllCompetitorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllCompetitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

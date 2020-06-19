import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommishStTeamsComponent } from './commish-st-teams.component';

describe('CommishStTeamsComponent', () => {
  let component: CommishStTeamsComponent;
  let fixture: ComponentFixture<CommishStTeamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommishStTeamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommishStTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

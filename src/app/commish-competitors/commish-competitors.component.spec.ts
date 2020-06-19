import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommishCompetitorsComponent } from './commish-competitors.component';

describe('CommishCompetitorsComponent', () => {
  let component: CommishCompetitorsComponent;
  let fixture: ComponentFixture<CommishCompetitorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommishCompetitorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommishCompetitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCompetitorsComponent } from './event-competitors.component';

describe('EventCompetitorsComponent', () => {
  let component: EventCompetitorsComponent;
  let fixture: ComponentFixture<EventCompetitorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventCompetitorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCompetitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

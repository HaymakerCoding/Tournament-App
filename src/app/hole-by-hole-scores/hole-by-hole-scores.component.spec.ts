import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoleByHoleScoresComponent } from './hole-by-hole-scores.component';

describe('HoleByHoleScoresComponent', () => {
  let component: HoleByHoleScoresComponent;
  let fixture: ComponentFixture<HoleByHoleScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoleByHoleScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoleByHoleScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

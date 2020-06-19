import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommishStRegComponent } from './commish-st-reg.component';

describe('CommishStRegComponent', () => {
  let component: CommishStRegComponent;
  let fixture: ComponentFixture<CommishStRegComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommishStRegComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommishStRegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

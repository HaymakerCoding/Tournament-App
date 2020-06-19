import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommishGuestRegComponent } from './commish-guest-reg.component';

describe('CommishGuestRegComponent', () => {
  let component: CommishGuestRegComponent;
  let fixture: ComponentFixture<CommishGuestRegComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommishGuestRegComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommishGuestRegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

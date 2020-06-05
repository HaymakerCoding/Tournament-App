import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizingComponent } from './prizing.component';

describe('PrizingComponent', () => {
  let component: PrizingComponent;
  let fixture: ComponentFixture<PrizingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrizingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrizingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

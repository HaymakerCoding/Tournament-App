import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizingPageComponent } from './prizing-page.component';

describe('PrizingPageComponent', () => {
  let component: PrizingPageComponent;
  let fixture: ComponentFixture<PrizingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrizingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrizingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

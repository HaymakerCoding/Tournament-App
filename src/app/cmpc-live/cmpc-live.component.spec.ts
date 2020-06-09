import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmpcLiveComponent } from './cmpc-live.component';

describe('CmpcLiveComponent', () => {
  let component: CmpcLiveComponent;
  let fixture: ComponentFixture<CmpcLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmpcLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmpcLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

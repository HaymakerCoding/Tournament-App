import { TestBed } from '@angular/core/testing';

import { CommishService } from './commish.service';

describe('CommishService', () => {
  let service: CommishService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommishService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

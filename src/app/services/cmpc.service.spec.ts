import { TestBed } from '@angular/core/testing';

import { CmpcService } from './cmpc.service';

describe('CmpcService', () => {
  let service: CmpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

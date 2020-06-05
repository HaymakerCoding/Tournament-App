import { TestBed } from '@angular/core/testing';

import { TournamentNewsService } from './tournament-news.service';

describe('TournamentNewsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TournamentNewsService = TestBed.get(TournamentNewsService);
    expect(service).toBeTruthy();
  });
});

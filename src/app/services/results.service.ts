
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ScoringType } from '../live-results/live-results.component';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  private _ApiBaseUrl = 'https://api.clubeg.golf/';
  
  constructor(private http: HttpClient) { }

  /**
   * Get all matches for the City Match Play Championship that are running in any event today
   * TODO
   */
  getResultsByYearDivision() {
    const URL = '';
    return this.http.get<any>(URL)
      .pipe(map(response => {
          return response;
      })
    );
  }

  /**
   * Get a list of all participants from all years of a tournament
   */
  getAllParticipants(tournamentId: string) {
    const params = new HttpParams().set('tournamentId', tournamentId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/participants/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get scores for multiple events, by team or individual
   * @param eventIds Ids of events to obtain scores for
   * @param scoringType Team or Individidual flag
   */
  getScores(eventIds: string[], scoringType: ScoringType, competitionId: string) {
    const params = new HttpParams({
      fromObject: { 'eventIds[]' : eventIds, 'scoringType': scoringType, 'competitionId': competitionId }
    });
    return this.http.get<any>(this._ApiBaseUrl + 'scores',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

}

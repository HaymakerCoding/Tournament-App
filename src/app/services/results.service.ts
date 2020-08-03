
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

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

}

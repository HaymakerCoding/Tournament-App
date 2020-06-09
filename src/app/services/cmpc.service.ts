import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

/**
 * Services related specifically to CMPC tournament
 */
@Injectable({
  providedIn: 'root'
})
export class CmpcService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Get the pars for the Slammer Event that this cmpc was played at
   */
  getPars(eventId: string) {
    const params = new HttpParams().set('eventId', eventId);
    const URL = 'https://clubeg.golf/common/api_REST/v1/slammer-tour/events/pars/get/index.php';
    return this.http.get<any>(URL, { params })
      .pipe(map(response => {
          return response;
      })
    );
  }

  /**
   * Get all the slammer scores for an event. CMPC and slammer are inter connected event wise so we need the scores from slammer to display cmpc results.
   */
  getScores(eventId: string){
    const params = new HttpParams().set('eventId', eventId);
    const URL = 'https://clubeg.golf/common/api_REST/v1/slammer-tour/events/scores/get-all-for-event/index.php';
    return this.http.get<any>(URL, { params })
      .pipe(map(response => {
          return response;
      })
    );
  }

}

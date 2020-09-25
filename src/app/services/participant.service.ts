import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  private _ApiBaseUrl = 'https://api.clubeg.golf/';

  constructor(private http: HttpClient) { }

  getTeamsBySeason(seasonId: string) {
    const params = new HttpParams().set('seasonId', seasonId);
    return this.http.get<any>(this._ApiBaseUrl + 'teams',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  getTeamsByEvent(eventId: string) {
    const params = new HttpParams().set('eventId', eventId);
    return this.http.get<any>(this._ApiBaseUrl + 'teams',
    { params });
  }
  
  getEventParticipants(eventId: string) {
    const params = new HttpParams().set('eventId', eventId);
    return this.http.get<any>(this._ApiBaseUrl + 'event-participants',
    { params });
  }

  /**
   * Get all individual participants in a season
   * @param seasonId Season PK
   */
  getIndividualsBySeason(seasonId: string) {
    const params = new HttpParams().set('seasonId', seasonId);
    return this.http.get<any>(this._ApiBaseUrl + 'individuals',
    { params }).pipe(map(response => {
      return response;
    }));
  }
}

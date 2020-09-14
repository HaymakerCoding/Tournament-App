import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Season } from '../models/Season';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private _ApiBaseUrl = 'https://api.clubeg.golf/';

  constructor(private http: HttpClient) { }

  /**
   * Get all tournament events for a season.
   * @param yearId Tournament Year ID
   * @param current boolean flag to alert API that we only want events up to today, not any that exist but have to been played yet
   */
  getAllEvents(season: Season, current: boolean) {
    const params = new HttpParams().set('seasonId', season.id.toString());
    if (current === true) {
      params.append('current', '1');
    }
    return this.http.get<any>(this._ApiBaseUrl + 'events',
    { params });
  }

}

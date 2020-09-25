import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Season } from '../models/Season';
import { Service } from './Service';

@Injectable({
  providedIn: 'root'
})
export class EventService extends Service {

  constructor(protected http: HttpClient ) {
    super(http)
   }

  /**
   * Get all tournament events for a season.
   * @param yearId Tournament Year ID
   * @param current boolean flag to alert API that we only want events up to today, not any that exist but have to been played yet
   */
  getAllEvents(season: Season, current: boolean) {
    let params;
    if (current === true) {
      params = new HttpParams().set('seasonId', season.id.toString()).set('current', '1');
    } else {
      params = new HttpParams().set('seasonId', season.id.toString());
    }
    return this.http.get<any>(this._ApiBaseUrl + 'events',
    { params });
  }

  /**
   * Get groups for event
   * @param eventId Event PK
   * @param tournamentId 
   * @param type 
   */
  getGroups(eventId: string) {
    const params = new HttpParams().set('eventId', eventId);
    return this.http.get<any>(this._ApiBaseUrl + 'groups',
    { params });
  }

}

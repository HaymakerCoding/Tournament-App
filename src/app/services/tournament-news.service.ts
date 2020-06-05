import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Registration } from '../models/Registration';

@Injectable({
  providedIn: 'root'
})
export class TournamentNewsService {

  constructor(
    private http: HttpClient
  ) { }

  getAll(tournamentId: string) {
    const params = new HttpParams().set('tournamentId', tournamentId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/news/get-all/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }
}


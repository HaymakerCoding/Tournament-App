import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/members/get-all-public/index.php')
      .pipe(map(response => {
        return response;
    }));
  }

  getMatchingMembers(text) {
    const params = new HttpParams().set('text', text);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/members/get-all-matching/index.php', { params })
      .pipe(map(response => {
        return response;
    }));
  }
}

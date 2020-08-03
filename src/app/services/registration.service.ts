import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Registration } from '../models/Registration';
import { Season } from '../models/Season';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(public http: HttpClient) {

  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', 'Bearer ' + token);
  }

  /**
   * Add new tournament registrations for the user logged in. Registrations is by Division so there is an array of possible many
   * @param tournamentId Tournament PK
   * @param year Year 4 digit
   * @param registrations Division Registrations chosen by the user
   */
  add(tournamentId: number, year: number, registrations: Registration[]) {
    const headers = this.getHeaders();
    return this.http.post<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/registrations/add/index.php', {
      tournamentId, year, registrations}, { headers }).pipe(map(response => {
      return response;
    }));
  }

  updateStatus(id, status) {
    const headers = this.getHeaders();
    return this.http.patch<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/registrations/update-status/index.php', {
      id, status}, { headers }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Change a user's divisions to play
   * @param id Registration ID
   * @param divisions new Divisions
   */
  updateDivisions(id, divisions) {
    const headers = this.getHeaders();
    return this.http.patch<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/registrations/update-divisions/index.php', {
      id, divisions}, { headers }).pipe(map(response => {
      return response;
    }));
  }

  getAll(tournamentId: string, year: string) {
    const params = new HttpParams().set('tournamentId', tournamentId).set('year', year);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/registrations/get-all/index.php', {
      params }).pipe(map(response => {
      return response;
    }));
  }

  isUserRegistered(tournamentId: string, year: string) {
    const headers = this.getHeaders();
    const params = new HttpParams().set('tournamentId', tournamentId).set('year', year);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/registrations/get/index.php', {
       params, headers }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * send an email to admin whenever a person registers of changes their registration
   * @param to The tournament name format needed for admin email to send to
   * @param tournamentName Tournament name used in email header
   * @param divisions Divison obj containing user's selected divisions registered in
   */
  sendNotifyRegEmail(to, tournamentName, divisions ) {
    const headers = this.getHeaders();
    return this.http.post<any>('https://clubeg.golf/common/api_REST/v1/clubeg/send-tournament-reg-email.php',
      { to, tournamentName, divisions}, { headers })
      .pipe(map(response => {
        return response;
    }));
  }

}

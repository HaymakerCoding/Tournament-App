import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UserReg } from '../commish-st-reg/commish-st-reg.component';
import { FormGroup } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class CommishService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getSTteams(year: string, yearId) {
    const params = new HttpParams().set('year', year).set('yearId', yearId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/commish/get-st-teams/index.php', { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get all ST qualifying registrations 1 of the slammer teams, for a year
   * @param yearId Year ID
   * @param teamId Team ID
   */
  getSTRegistrations(yearId: string, teamId: string) {
    const params = new HttpParams().set('yearId', yearId).set('teamId', teamId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/commish/get-qualifying-registrations/index.php', { params })
      .pipe(map(response => {
        return response;
    }));
  }

  registerQualifier(reg: UserReg ) {
    const headers = this.authService.getHeaders();
    return this.http.post<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/commish/register-for-qualifying/index.php', { reg }, { headers })
      .pipe(map(response => {
        return response;
    }));
  }

  getUserQualifyingReg(yearId: string) {
    const headers = this.authService.getHeaders();
    const params = new HttpParams().set('yearId', yearId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/commish/get-user-qualifying-reg/index.php', { params, headers })
      .pipe(map(response => {
        return response;
    }));
  }

  deleteQulifyingReg(id: string) {
    const headers = this.authService.getHeaders();
    const params = new HttpParams().set('id', id);
    return this.http.delete<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/commish/delete-qualifying/index.php', { params, headers })
      .pipe(map(response => {
        return response;
    }));
  }

  updateQulifyingReg(reg: UserReg) {
    const headers = this.authService.getHeaders();
    return this.http.patch<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/commish/update-qualifying/index.php', { reg }, { headers })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get the current Slammer Tour ranks. This is a list of members organized by division and their rank in that division
   */
  getRanks(dateTime: any, leagueId: string) {
    const params = new HttpParams().set('leagueId', leagueId).set('dateTime', dateTime);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/slammer-tour/events/get-ranks/index.php', { params })
    .pipe(map(response => {
      return response;
    }));
  }

   /**
   * Send email to register a guest team
   * @param form Form
   * @param to String value for TO part of email, this should be the tournament host value, then server will append rest of field
   */
  sendGuestTeamEmail(form: FormGroup, to: string) {
    return this.http.post<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/cmpc/guest-team-email/index.php',
      { form, to })
      .pipe(map(response => {
        return response;
    }));
  }


}

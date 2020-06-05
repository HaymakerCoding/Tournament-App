import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Tournament } from '../models/Tournament';
import { TournamentYearlyData } from '../models/TournamentYearlyData';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  private tournament: Tournament;
  private host: string;
  private yearlyData: TournamentYearlyData;

  constructor(public http: HttpClient) {
    this.setHost();
  }

  getTournament(): Tournament {
    return this.tournament;
  }

  getYearlyData() {
    return this.yearlyData;
  }

  /**
   * The tournament service will be responsible for maintaining the appropriate tournament data for all components.
   * This data pulled is based on the host which is set here.
   */
  private setHost() {
    this.host = window.location.hostname;
    // IF running in dev set to city match play for testing
    if (this.host === 'localhost') {
      this.host = 'dev.ottawasunscramble.golf';
    }
    console.log('Loading data for host: ' + this.host);
  }

  /**
   * Retrieve all tournament data by the host website
   * @param host Website host name
   */
  setTournament() {
    const params = new HttpParams().set('host', this.host);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/get-by-host/index.php', {
      params }).pipe(map(response => {
      if (response.status === 200) {
        this.tournament = response.payload;
      } else {
        console.error(response);
      }
      return response;
    }));
  }

  setYearlyData() {
    const year = new Date().getFullYear().toString();
    const params = new HttpParams().set('tournamentId', this.tournament.id.toString()).set('year', year);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/get-year-data/index.php', {
      params }).pipe(map(response => {
      if (response.status === 200) {
        this.yearlyData = response.payload;
      } else {
        console.error(response);
      }
      return response;
    }));
  }

  /**
   * Get a list of all years of the tournament
   */
  getYears(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/get-years/index.php', { params })
    .pipe(map(response => {
      return response;
    }));
  }

  getAllDivisions(tournamentId: string) {
    const params = new HttpParams().set('tournamentId', tournamentId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/divisions/get-all/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

  getDivisionSponsor(id) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/sponsors/get/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get all champions for a tournament by year selected.
   * @param tournamenId Tournament PK
   * @param year 4 digit year
   */
  getAllChampions(tournamenId, year) {
    const params = new HttpParams().set('tournamentId', tournamenId).set('year', year);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/champions/get-all-by-year/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get all champions for a tournament ALL YEARS
   * @param tournamenId Tournament PK
   */
  getAllChampionsAllYears(tournamenId) {
    const params = new HttpParams().set('tournamentId', tournamenId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/champions/get-all/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get all rules set for a tournament
   * @param tournamentId Tournament PK
   */
  getAllRulesByTournament(tournamentId: string) {
    const params = new HttpParams().set('tournamentId', tournamentId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/rules/get-all-by-tournament/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

  sendContactEmail(form) {
    return this.http.post<any>('https://clubeg.golf/common/api_REST/v1/clubeg/send-contact-email.php',
      { form })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Send email to admin to add the user to subscribtion
   * @param form Form values email and name
   */
  sendSubscribeEmail(form, to) {
    return this.http.post<any>('https://clubeg.golf/common/api_REST/v1/clubeg/send-tournament-subscribe-email.php',
      { form, to })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get a list of rules that are global,used in all tournaments
   */
  getGlobalRules() {
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/rules/get-all/index.php')
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get a full list of all sponsors, don't need all data, just for a table list
   */
  getAllSponsors() {
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/sponsors/get-all/index.php')
      .pipe(map(response => {
        return response;
    }));
  }

  getAllFaqs() {
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/faq/get-all/index.php')
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get all FAQs set for a tournament
   * @param tournamentId Tournament PK
   */
  getAllFaqsByTournament(tournamentId: string) {
    const params = new HttpParams().set('tournamentId', tournamentId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/faq/get-all-by-tournament/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Tournament } from '../models/Tournament';
import { TournamentYearlyData } from '../models/TournamentYearlyData';
import { Season } from '../models/Season';
import { Classification } from '../models/Event';
import { ScoringType } from '../live-results/live-results.component';

/**
 * Because this tournament app is user focused and most the CRUD operations are done with a seperate App, we will use this tournament services for most the GET only actions need 
 * for various data models. In the admin version of this app these services are split up more into their own dedicated service files.
 * 
 * @author Malcolm
 */
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
    this.host = window.location.hostname.replace('www.', '');
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

  /**
   * Set the yearly data for the CURRENT year
   */
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
   * Get yearly data for ANY year supplied
   */
  getYearlyDataAny(year: string) {
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

  getAllDivisions(season: Season) {
    const params = new HttpParams().set('seasonId', season.id.toString());
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/season/division/get-all/index.php',
      { params })
      .pipe(map(response => {
        return response;
    }));
  }

  getDivision(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/season/division/get/index.php',
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

  /**
   * Get all matches for the City Match Play Championship that are running in any event today
   */
  getCMPCmatchesForToday() {
    const URL = 'https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/cmpc/get-all-for-today/index.php';
    return this.http.get<any>(URL)
      .pipe(map(response => {
          return response;
      })
    );
  }

  /**
   * Get all teams for a tournament year
   * @param yearId Tournament Year PK
   */
  getAllTeams(yearId: string) {
    const params = new HttpParams().set('yearId', yearId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/tournaments/teams/get-by-year/index.php', { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get all tournament events by a tournament year record id
   * @param yearId Tournament Year ID
   */
  getAllEvents(season: Season) {
    const params = new HttpParams().set('seasonId', season.id.toString())
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/get-all/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

   /**
   * Get all tournament events for a season that have happened or are happening. Not future events
   * @param yearId Tournament Year ID
   */
  getAllCurrentEvents(season: Season) {
    const params = new HttpParams().set('seasonId', season.id.toString())
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/get-all-current/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get all tournament events by a classfication type main or qualifier
   * @param yearId Tournament Year ID
   */
  getAllEventsByClassification(season: Season, classification: Classification) {
    const params = new HttpParams().set('seasonId', season.id.toString()).set('classification', classification);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/get-all-by-class/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  getEvent(id: string) {
    const params = new HttpParams().set('id', id)
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/get/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get a current tournament season.
   * @param eventTypeId Event Type ID base class ID for the event
   * @param year 4 digit year
   */
  getSeason(eventTypeId: string, year: string) {
    const params = new HttpParams().set('eventTypeId', eventTypeId).set('year', year);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/season/get/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get all seasons for an event type
   * @param eventTypeId Event Type ID base class ID for the event
   */
  getAllSeasons(eventTypeId: string) {
    const params = new HttpParams().set('eventTypeId', eventTypeId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/season/get-all/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  getGroups(eventId: string, tournamentId: string, type: string) {
    const params = new HttpParams().set('eventId', eventId).set('tournamentId', tournamentId).set('type', type);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/group/get-all/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get the scorecard for the event
   * @param id Scorecard ID
   */
  getScorecard(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/courses/scorecard/get/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Fetch the sponsors assigned to this season of the tournament
   * @param seasonId Season PK
   */
  getSeasonSponsors(seasonId: string) {
    const params = new HttpParams().set('seasonId', seasonId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/season/sponsor/get-all/index.php', { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Fetch all courses that are assigned to this season of the tournament
   * @param seasonId Season PK
   */
  getSeasonCourses(seasonId: string) {
    const params = new HttpParams().set('seasonId', seasonId);
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/season/course/get-all/index.php', { params })
      .pipe(map(response => {
        return response;
    }));
  }

  /**
   * Get all participants in an event
   */
  getEventParticipants(eventId: string, type: string) {
    const params = new HttpParams().set('eventId', eventId).set('type', type)
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/participant/get-all/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get all participants in an event
   */
  getParticipants(eventId: string, type: string) {
    const params = new HttpParams().set('eventId', eventId).set('type', type)
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/participant/get-all/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get all participants in ALL EVENTS
   */
  getTournamentParticipants(tournament: Tournament, type: ScoringType) {
    const params = new HttpParams().set('eventTypeId', tournament.eventTypeId.toString()).set('type', type)
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/clubeg/event/participant/get-all-for-tournament/index.php',
    { params }).pipe(map(response => {
      return response;
    }));
  }


}

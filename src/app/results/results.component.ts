import { Component, OnInit, OnDestroy } from '@angular/core';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { TournamentBase } from '../tournamentBase';
import { Division } from '../models/Division';
import { CmpcService } from '../services/cmpc.service';
import { ResultsService } from '../services/results.service';
import { CMPCmatch } from '../models/CMPCmatch';

/**
 * Show the results of matches for a tournament. Selectable by year and division.
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent extends TournamentBase implements OnInit, OnDestroy {

  years: number[];
  yearSelected: number;
  divisions: Division[];
  divisionSelected: Division;
  noResults: boolean;
  allCmpcMatches: CMPCmatch[];
  divisionalCmpcMatches: CMPCmatch[];
  cmpcRounds = ['Final', 'Semi-Final', 'Quarter-Final', '2', '1'];

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private cmpcService: CmpcService,
    private resultsService: ResultsService
    
  ) {
    super(tournamentService, titleService);
   }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  next() {
    this.setLoadingPercent(25);
    this.getYears();
  }

  /**
   * Get just a list of years that this tournament has data for
   */
  getYears() {
    this.subscriptions.push(this.tournamentService.getYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.years = response.payload;
        this.yearSelected = this.years[0];
        this.setLoadingPercent(50);
        this.getDivisions();
      } else {
        console.error(response);
      }
    }));
  }

  onYearChange() {
    this.setLoadingPercent(70);
    this.getCMPCresults();
  }

  getLoadingPercent() {
    return this.loadingPercent;
  }

  /**
   * Get the divisions available for this tournament
   */
  getDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
        this.divisionSelected = this.divisions[0];
        this.setLoadingPercent(70);
        this.getResults();
      } else {
        console.error(response);
      }
    }));
  }

  getResults() {
    if (+this.tournament.id === 2) {
      this.getCMPCresults();
    } else {
      this.noResults === true;
      this.setLoadingPercent(100);
    }
  }

  /**
   * Specifically get the CMPC tournment matches, by the year selected.
   * Select all divisions so we can then manipulate divisions to show without fetching data again
   */
  getCMPCresults() {
    this.subscriptions.push(this.cmpcService.getResultsByYear(this.yearSelected.toString()).subscribe(response => {
      if (response.status === 200) {
        this.allCmpcMatches = response.payload;
        this.setLoadingPercent(90);
        this.setDivMatches();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Filter out the matches for the division selected by user
   */
  setDivMatches() {
    this.divisionalCmpcMatches = this.allCmpcMatches.filter(x => x.division === this.divisionSelected.name);
    this.setLoadingPercent(100);
    console.log(this.divisionalCmpcMatches);
  }

  getRoundMatches(round: string):CMPCmatch[] {
    return this.divisionalCmpcMatches.filter(x => x.round.toLowerCase() === round.toLowerCase());
  }

  getHoleScore(hole: number) {
    return 0;
  }



}


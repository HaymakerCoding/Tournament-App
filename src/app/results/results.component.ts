import { Component, OnInit, OnDestroy } from '@angular/core';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { TournamentBase } from '../tournamentBase';
import { Division } from '../models/Division';
import { CmpcService } from '../services/cmpc.service';
import { ResultsService } from '../services/results.service';
import { CMPCmatch } from '../models/CMPCmatch';
import { Season } from '../models/Season';
import { Event } from '../models/Event';
import { GroupParticipant } from '../models/GroupParticipant';
import { Scorecard } from '../models/Scorecard';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

/**
 * Show the results of matches for a tournament. Selectable by year and division.
 * Let's try and make this work as a point for all tournaments, splitting out to different functions or components as need for specific tournament needs.
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
  events: Event[];
  season: Season;
  groupsFetched = 0;
  scorecardsFetched = 0;
  columns = ['competitor', 'holes', 'round1', 'round2', 'round3', 'total'];
  seasons: Season[];

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private cmpcService: CmpcService,
    private router: Router
    
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
    this.setLoadingPercent(20);
    this.getSeasons();
  }

  /**
   * Get just a list of years that this tournament has data for
   */
  getSeasons() {
    this.subscriptions.push(this.tournamentService.getAllSeasons(this.tournament.eventTypeId.toString()).subscribe(response => {
      if (response.status === 200) {
        this.seasons = response.payload;
        this.season = this.seasons[0];
        this.yearSelected = this.season.year;
        this.setLoadingPercent(40);
        this.getDivisions();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * User changed year of tournament. Reset data and fetch results for new year selected
   */
  onYearChange() {
    this.events = [];
    this.season = null;
    this.groupsFetched = 0;
    this.scorecardsFetched = 0;
    this.setLoadingPercent(20);
    this.getDivisions();
  }

  getLoadingPercent() {
    return this.loadingPercent;
  }

  /**
   * Get the divisions available for this tournament
   */
  getDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.season).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
        this.getResults();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Generic get Results function. We can set different paths for different tournaments here.
   */
  getResults() {
    if (+this.tournament.id === 2) {
      this.getCMPCresults();
    } else {
      this.router.navigate(['/results/live'])
      //this.getSeason();
    }
  }

  getEvents() {
    this.subscriptions.push(this.tournamentService.getAllEvents(this.season).subscribe(response => {
      if (response.status === 200) {
        this.events = response.payload;
        if (this.events.length > 0) {
          this.setLoadingPercent(70);
          this.events.forEach(event => {
            this.getAllGroups(event)
          });
        } else {
          this.noResults = true;
          this.setLoadingPercent(100);
        }
      } else {
        console.error(response);
      }
    }));
  }

  getAllGroups(event: Event) {
    this.subscriptions.push(this.tournamentService.getGroups(event.id.toString(), this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        event.groups = response.payload;
        this.groupsFetched++;
        if (this.groupsFetched === this.events.length) {
          this.setLoadingPercent(80);
          this.getScorecards();
        }
      } else {
        console.error(response);
      }
    }));
  }

  getScorecards() {
    this.events.forEach(event => {
      this.getScorecard(event);
    });
  }

  /**
   * Get the scorecard for the event
   */
  getScorecard(event: Event) {
    this.subscriptions.push(this.tournamentService.getScorecard(event.scorecardId.toString()).subscribe(response => {
      if (response.status === 200) {
        event.scorecard = response.payload;
        this.scorecardsFetched++;
        if (this.scorecardsFetched === this.events.length) {
          this.setLoadingPercent(100);
        }
      } else {
        console.error(response);
      }
    }));
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
    if (this.tournament.id === 2) {
      this.divisionalCmpcMatches = this.allCmpcMatches.filter(x => x.division === this.divisionSelected.name);
      this.setLoadingPercent(100);
    }
  }

  getRoundMatches(round: string):CMPCmatch[] {
    return this.divisionalCmpcMatches.filter(x => x.round.toLowerCase() === round.toLowerCase());
  }

  /**
   * Return the score a player got on a specific hole
   * @param hole Hole number
   * @param scores Array of Score objs holding score->hole combo for player
   */
  getHoleScore(hole: number, scores: Score[]) {
    return scores.find(x => x.hole === hole).score;
  }

  getDivisionParticipants(event: Event) {
    const participants: GroupParticipant[] = [];
    event.groups.forEach(group => {
      group.groupParticipants.forEach(participant => {
        if (+participant.divisions[0].id === +this.divisionSelected.id) {
          participant.score = this.getScore(participant, this.getHoleComplete(participant), event.scorecard);
          participants.push(participant);
        }
      });
    });
    participants.sort((a, b) => {
      return a.score - b.score;
    });
    return participants;
  }

  /**
   * Return the participants current score.
   * Compare their hole scores total to toal pars.
   * @param participant Grooup Participant
   * @param maxHoleComplete The Max hole the participant has played up to
   */
  getScore(participant: GroupParticipant, maxHoleComplete: number, scorecard: Scorecard): number {
    let targetPar = 0;
    let usersScore = 0;
    scorecard.scorecardHoles.forEach(hole => {
      if (+hole.no <= +maxHoleComplete) {
        targetPar += +hole.par;
      }
    });
    participant.holeScores.forEach(holeScore => {
      if (+holeScore.hole <= +maxHoleComplete) {
        usersScore += +holeScore.score;
      }
    });
    return usersScore - targetPar;
  }

  /**
   * Get the max hole completed by a participant
   */
  getHoleComplete(participant: GroupParticipant): number {
    let max = 0;
    const holeScores = participant.holeScores;
    if (holeScores) {
      participant.holeScores.forEach(holeScore => {
        if (+holeScore.hole > max) {
          max = holeScore.hole;
        }
      });
    }
    return max;
  }

  getDatasource() {

    return new MatTableDataSource();
  }


}

interface Score{
  hole: number,
  score: number
}


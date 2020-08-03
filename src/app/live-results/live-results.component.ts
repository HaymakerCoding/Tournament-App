import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Division } from '../models/Division';
import { Season } from '../models/Season';
import { Event } from '../models/Event';
import { GroupParticipant } from '../models/GroupParticipant';
import { Scorecard } from '../models/Scorecard';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HoleByHoleScoresComponent } from '../hole-by-hole-scores/hole-by-hole-scores.component';
import { MatTableDataSource } from '@angular/material/table';
import { ResultsService } from '../services/results.service';

/**
 * Show a leaderboard view of all players.
 * Filtered by division selected.
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-live-results',
  templateUrl: './live-results.component.html',
  styleUrls: ['./live-results.component.scss']
})
export class LiveResultsComponent extends TournamentBase implements OnInit {

  years: number[];
  yearSelected: number;
  divisions: Division[];
  validTournaments = [3]; // list of tournaments where live results are in place
  divisionSelected: Division;
  season: Season;
  events: Event[];
  groupsFetched = 0;
  scorecardsFetched = 0;
  displayParticipants: GroupParticipant[] = [];
  cutParticipants: GroupParticipant[] = [];
  dialogRef: MatDialogRef<any>;
  columns = ['competitor', 'holes', 'round1', 'round2', 'round3', 'total'];
  dataSource: MatTableDataSource<any>;
  cutDataSource: MatTableDataSource<any>;
  searchDataSource: MatTableDataSource<any>;
  searchedParticipants: TournamentParticipant[];
  allParticipants: TournamentParticipant[];
  searchColumns = ['name', 'year', 'division'];

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private resultsService: ResultsService,
    private dialog: MatDialog
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
    this.setLoadingPercent(10);
    this.getAllParticipants();
    this.getYears();
  }

  getAllParticipants() {
    this.subscriptions.push(this.resultsService.getAllParticipants(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.allParticipants = response.payload;
        console.log(this.allParticipants);
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get just a list of years that this tournament has data for
   */
  getYears() {
    this.subscriptions.push(this.tournamentService.getYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.years = response.payload;
        this.yearSelected = this.years[0];
        this.setLoadingPercent(15);
        this.getSeason();
      } else {
        console.error(response);
      }
    }));
  }

  getSeason() {
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.id.toString(), this.yearSelected.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.setLoadingPercent(40);
        this.getDivisions();
      } else {
        console.error(response);
      }
    }));
  }

  getDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.season).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
        this.setLoadingPercent(30);
        this.getEvents();
      } else {
        console.error(response);
      }
    }));
  }

  

  getEvents() {
    this.subscriptions.push(this.tournamentService.getAllEvents(this.season).subscribe(response => {
      if (response.status === 200) {
        this.events = response.payload;
        this.setLoadingPercent(50);
        this.events.forEach(event => {
          this.getAllGroups(event)
        });
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
   * Fired when a division is selected to view.
   * We filter the participants shown by that division
   * After which we sort the scores and provide the arrays to the table data
   */
  onDivisionSelected() {
    this.setLoadingPercent(20);
    if (this.displayParticipants) {
      this.displayParticipants.forEach(x => {
        x.roundTotalScores = null;
      });
      this.displayParticipants = [];
    }
    this.events.forEach(event => {
      this.filterGroupsByDivision(event)
    });
    this.setFinalScore();
    this.sortScores();
    let index = 0;
    // seperate out those that didn't make the cut
    this.cutParticipants = [];
    for (let participant of this.displayParticipants) {
      if (this.checkMadeCut(index) === false) {
        this.cutParticipants.push(this.displayParticipants[index]);
      }
      index++;
    }
    this.cutParticipants.sort((a, b) => {
      return a.finalScore - b.finalScore;
    });
    this.displayParticipants = this.displayParticipants.filter(x => this.cutParticipants.some(cut => +cut.memberId === +x.memberId) === false);
    this.dataSource = new MatTableDataSource(this.displayParticipants);
    this.cutDataSource = new MatTableDataSource(this.cutParticipants);
  }

  filterGroupsByDivision(event: Event) {
    event.groups.forEach(group => {
      group.groupParticipants.forEach(participant => {
        participant.divisions.forEach( division => {
          if (+division.id === +this.divisionSelected.id && this.displayParticipants.some(x => +x.memberId === +participant.memberId) === false) {
            this.displayParticipants.push(participant);
          }
        });
      });
    });
    this.setCurrentScore(event);
  }

  setFinalScore() {
    this.displayParticipants.forEach(participant => {
      let total = 0;
      participant.roundTotalScores.forEach(x => {
        total += x;
      });
      if (participant.roundTotalScores.length === this.events.length) {
        //played all rounds
        participant.finalScore = total;
      } else {
        if (participant.divisions[0].name === 'Professional') {
          // professional only plays 2 rounds of 3
          participant.finalScore = total;
        } else {
          participant.finalScore = 900 + total;
        }
      }
    })
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

  /**
   * Check and set each participants score.
   * Score is calculated by comparing total par of all holes complete against the players par total
   */
  setCurrentScore(event: Event) {
    this.displayParticipants.forEach(x => {
      const eventParticipant = this.getEventParticipant(x, event);
      if (eventParticipant) {
        if (!x.roundTotalScores) {
          x.roundTotalScores = [];
        }
        x.roundTotalScores.push(this.getScore(eventParticipant, this.getHoleComplete(eventParticipant), event.scorecard));
      }
    });
  }

  sortScores() {
    this.displayParticipants.sort((a, b) => {
        return a.finalScore - b.finalScore;
    });
    this.setLoadingPercent(100);
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
  getTotalHolesComplete(participant: GroupParticipant): number {
    let total = 0;
    this.events.forEach(event => {
      const participantFound: GroupParticipant = this.getEventParticipant(participant, event);
      if (participantFound && participantFound.holeScores) {
        participantFound.holeScores.forEach(holeScore => {
          if (+holeScore.id) {
            total ++;
          }
        });
      }
    });
    return total;
  }

  /**
   * Show a dialog containing hole by hole scores for a participant
   * @param participant Group participant
   */
  showHoleByHole(participant) {
    this.dialogRef = this.dialog.open(HoleByHoleScoresComponent, { data: { participant, events: this.events }, minWidth: '100vw', minHeight: '100vh' })
  }

  
  getEventScore(participant: GroupParticipant, event: Event, index: number): any {
    const score = participant.roundTotalScores[index];
    if (score) {
      return score > 0 ? '+' + score : score === 0 ? 'Even' : score;
    } else {
      return 'N/A';
    }
  }

  /**
   * Return a specific event participant that matches the display participant passed in
   * @param participant Display Participant
   * @param event 
   */
  getEventParticipant(participant: GroupParticipant, event: Event): GroupParticipant {
    let eventParticipant: GroupParticipant;
    event.groups.forEach(group => {
      group.groupParticipants.forEach(p=> {
        if (p.memberId === participant.memberId){
          eventParticipant = p;
        }
      });
    });
    return eventParticipant;
  }

  /**
   * Calculate all strokes a player took for the hole event
   * @param participant Group Participant
   * @param event Event
   */
  getTotalStrokes(participant: GroupParticipant, event: Event) {
    const eventParticipant = this.getEventParticipant(participant, event);
    if (eventParticipant) {
      let total = 0;
      eventParticipant.holeScores.forEach(x => {
        total += +x.score;
      });
      return total;
    } else {
      return null;
    }
  }

  checkMadeCut(index) {
    if (this.divisionSelected.name === 'A Division' || 
    this.divisionSelected.name === 'B Division' ||
      this.divisionSelected.name === 'Senior Open') {
        if ((index + 1) <= 10 ) {
          return true;
        } else {
          return false;
        }
    } else if (this.divisionSelected.name === 'C Division') {
      if ((index + 1) <= 13 ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  getDatasource() {
    return this.dataSource;
  }

  getCutDatasource() {
    return this.cutDataSource;
  }

  getSearchDatasource() {
    return this.searchDataSource;
  }

  /**
   * Return the total score from all rounds played for a player who was CUT before the final round, didn't make it to final so no score on final round
   * @param participant Group participant
   */
  getCutTotal(participant) {
    let total = 0;
    participant.roundTotalScores.forEach(x => {
      total += x;
    });
    return total > 0 ? '+' + total : total === 0 ? 'Event' : total;
  }

  onYearChange() {
    this.groupsFetched = 0;
    this.scorecardsFetched = 0;
    this.setLoadingPercent(15);
    this.getDivisions();
  }

  /**
   * Filter and show a list of matching participant (All Tournamnet Participants) by user entered text
   * @param text User entered text
   */
  searchByPlayer(text: string) {
    this.searchedParticipants = [];
    if (text.length > 0) {
      this.searchedParticipants = this.allParticipants.filter(x => x.fullName.toLowerCase().startsWith(text.toLowerCase()));
    } else {
      this.searchedParticipants = [];
    }
    this.searchDataSource = new MatTableDataSource(this.searchedParticipants);
  }

  /**
   * When user clicks on a search result tournament participant record, setup the page to show those results, div/year combo
   * @param participant 
   */
  onSearchedParticipantClick(participant: TournamentParticipant) {
    this.searchedParticipants = [];
    this.divisionSelected = this.divisions.find(x => x.name === participant.divisionName);
    this.yearSelected = +participant.year;
    this.onDivisionSelected();
  }
  

}

interface TournamentParticipant {
  fullName: string,
  divisionName: string,
  year: number,
  memberId: number
}

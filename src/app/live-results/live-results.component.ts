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
import { Team } from '../models/Team';
import { Individual } from '../models/Individual';
import { EventParticipant } from '../models/EventParticipant';
import { EventDivision } from '../models/EventDivision';
import { MatInput } from '@angular/material/input';

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
  validTournaments = [3, 1]; // list of tournaments where live results are in place
  divisionSelected: EventDivision;
  season: Season;
  events: Event[];
  eventSelected: Event;
  displayTeams: Team[] = [];
  displayIndividuals: Individual[] = [];
  cutParticipants: any[] = [];
  dialogRef: MatDialogRef<any>;
  columns: string[];
  dataSource: MatTableDataSource<any>;
  cutDataSource: MatTableDataSource<any>;
  searchDataSource: MatTableDataSource<any>;
  searchedParticipants: TournamentParticipant[];
  allParticipants: any[];
  searchColumns = ['name', 'eventName', 'year', 'division'];
  scoringType: ScoringType;
  teams: Team[];
  individuals: Individual[];

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
    this.columns = this.tournament.id === 3 ? ['pos', 'competitor', 'holes', 'round1', 'round2', 'round3', 'total'] : ['pos', 'competitor',  'holes', 'total'];
    this.setLoadingPercent(10);
    this.setScoringType();
    this.getYears();
  }

  setScoringType() {
    switch (+this.tournament.eventTypeId) {
      case 1: {
        this.scoringType= ScoringType.TEAM;
        break;
      }
      case 3: {
        this.scoringType = ScoringType.INDIVIDUAL;
        break;
      }
      default: {
        console.error('Error - scoring type not set for this event type');
        break;
      }
    }
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
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), this.yearSelected.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.setLoadingPercent(40);
        this.getEvents();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get all events for the season
   */
  getEvents() {
    this.subscriptions.push(this.tournamentService.getAllCurrentEvents(this.season).subscribe(response => {
      if (response.status === 200) {
        this.events = response.payload;
        this.setLoadingPercent(80);
        this.getAllTournamentParticipants();
      } else {
        console.error(response);
      }
    }));
  }

  getAllTournamentParticipants() {
    this.subscriptions.push(this.tournamentService.getTournamentParticipants(this.tournament, this.scoringType).subscribe(response => {
      if (response.status === 200) {
        this.allParticipants = response.payload;
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
  }

  getEventParticipants() {
    console.log(this.eventSelected.divisionList);
    this.subscriptions.push(this.tournamentService.getParticipants(this.eventSelected.id.toString(), this.scoringType).subscribe(response => {
      if (response.status === 200) {
        this.scoringType === ScoringType.TEAM ? this.teams = response.payload : this.individuals = response.payload;
        console.log(this.teams);
        if (this.divisionSelected) {
          this.onDivisionChange();
        }
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get the scorecard for the event
   */
  getScorecard() {
    this.subscriptions.push(this.tournamentService.getScorecard(this.eventSelected.scorecardId.toString()).subscribe(response => {
      if (response.status === 200) {
        this.eventSelected.scorecard = response.payload;
        this.getEventParticipants();
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
  onDivisionChange() {
    this.setLoadingPercent(20);
    /*
    if (this.displayParticipants) {
      this.displayParticipants.forEach(x => {
        x.roundTotalScores = null;
      });
      this.displayParticipants = [];
    }
    */
    this.filterParticipantsByDivision(this.eventSelected);
    this.setFinalScore();
    this.sortScores();
    this.setPos();

    if (this.tournament.id === 3) {
      // CITIZEN CUT LOGIC?
      let index = 0;
      // seperate out those that didn't make the cut
      this.cutParticipants = [];
      for (let participant of this.displayIndividuals) {
        if (this.checkMadeCut(index) === false) {
          this.cutParticipants.push(this.displayIndividuals[index]);
        }
        index++;
      }
      this.cutParticipants.sort((a, b) => {
        return a.finalScore - b.finalScore;
      });
      this.displayIndividuals = this.displayIndividuals.filter(x => this.cutParticipants.some(cut => +cut.memberId === +x.memberId) === false);
      this.cutDataSource = new MatTableDataSource(this.cutParticipants);
    }
    this.dataSource = this.scoringType === ScoringType.TEAM ? new MatTableDataSource(this.displayTeams): new MatTableDataSource(this.displayIndividuals);
    this.setLoadingPercent(100);
  }

  getParticipants() {
    return this.scoringType === ScoringType.TEAM ? this.displayTeams : this.displayIndividuals;
  }

  filterParticipantsByDivision(event: Event) {
    if (this.scoringType === ScoringType.TEAM) {
      this.displayTeams = this.teams.filter(team => +team.teamMembers[0].competitionId === +this.divisionSelected.competitionId);
    } else {
      this.displayIndividuals = this.individuals.filter(individual => +individual.competitionId === +this.divisionSelected.competitionId);
    }
    this.setScore(event);
  }

  setFinalScore() {
    this.displayIndividuals.forEach(participant => {
      let total = 0;
      participant.roundTotalScores.forEach(x => {
        total += x;
      });
      if (participant.roundTotalScores.length === this.events.length) {
        //played all rounds
        participant.finalScore = total;
      } else {
        if (participant.division === 'Professional') {
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
  getHolesComplete(participant: EventParticipant): number {
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
  setScore(event: Event) {
    this.displayIndividuals.forEach(x => {
      x.score = this.getScore(x, this.getHolesComplete(x), event.scorecard);
    });
    this.displayTeams.forEach(x => {
      x.score = this.getScore(x, this.getHolesComplete(x), event.scorecard);
    });
  }

  /**
   * Set all participants positions in the scoring by score
   */
  setPos() {
    let index = 0;
    let posNum = 1;
    let currentTieScore;
    let currentTiePos;
    this.displayTeams.forEach(x => {
      if (index !== 0) {
        const aboveTeam = this.displayTeams[index - 1];
        if (+aboveTeam.score === +x.score) {
          currentTiePos = currentTiePos ? currentTiePos : posNum;
          x.pos = 'T' + (currentTiePos);
          aboveTeam.pos = 'T' + (currentTiePos);
          posNum += 1;
        } else {
          currentTiePos = null;
          posNum += 1;
          x.pos = posNum;
        }
      } else {
        x.pos = posNum;
      }
      index += 1;
    });
  }

  sortScores() {
    const list = this.scoringType === ScoringType.TEAM ? this.displayTeams : this.displayIndividuals;
    list.sort((a, b) => {
        return a.score - b.score;
    });
  }

  /**
   * Return the participants current score.
   * Compare their hole scores total to toal pars.
   * @param participant Grooup Participant
   * @param maxHoleComplete The Max hole the participant has played up to
   */
  getScore(participant: EventParticipant, maxHoleComplete: number, scorecard: Scorecard): number {
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
  getTotalHolesComplete(participant): number {
    let total = 0;
    this.events.forEach(event => {
      if (participant && participant.holeScores) {
        participant.holeScores.forEach(holeScore => {
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
    const events: Event[] = [];
    events.push(this.eventSelected);
    const individuals: Individual[] = [];
    if (this.scoringType === ScoringType.INDIVIDUAL) {
      individuals.push(participant);
    }
    const teams: Team[] = [];
    if (this.scoringType === ScoringType.TEAM){
      teams.push(participant);
    }
    this.dialogRef = this.dialog.open(HoleByHoleScoresComponent, { data: { teams, individuals, events, scoringType: this.scoringType }, minWidth: '100vw', minHeight: '100vh' })
  }

  
  getEventScore(participant: GroupParticipant, event: Event, index: number): any {
    const score = participant.score;
    if (score) {
      return score > 0 ? '+' + score : score === 0 ? 'Even' : score;
    } else {
      return 'N/A';
    }
  }

  /**
   * Calculate all strokes a player took for the hole event
   * @param participant Group Participant
   * @param event Event
   */
  getTotalStrokes(participant, event: Event) {
    if (participant && participant.holeScores) {
      let total = 0;
      participant.holeScores.forEach(x => {
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
    this.setLoadingPercent(15);
    this.eventSelected = null;
    this.displayIndividuals = [];
    this.displayTeams = [];
    this.getEvents();
  }

  onEventChange() {
    this.divisionSelected = null;
    this.getScorecard();
  }

  /**
   * Filter and show a list of matching participant (All Tournamnet Participants) by user entered text
   * @param text User entered text
   */
  searchByPlayer(text: string) {
    this.searchedParticipants = [];
    if (text.length > 0) {
      if (this.scoringType === ScoringType.TEAM) {
        this.searchedParticipants = this.allParticipants.filter(x => x.teamMembers[0].fullName.toLowerCase().startsWith(text.toLowerCase()));
      } else {
        this.searchedParticipants = this.allParticipants.filter(x => x.fullName.toLowerCase().startsWith(text.toLowerCase()));
      }
    } else {
      this.searchedParticipants = [];
    }
    this.searchDataSource = new MatTableDataSource(this.searchedParticipants);
  }

  /**
   * When user clicks on a search result tournament participant record, setup the page to show those results, div/year combo
   * @param participant 
   */
  onSearchedParticipantClick(participant, input: MatInput) {
    input.value = null;
    this.searchedParticipants = [];
    this.eventSelected = this.events.find(x => +x.id === +participant.eventId);
    this.yearSelected = +participant.year;
    const competitionId = this.scoringType === ScoringType.TEAM ? participant.teamMembers[0].competitionId : participant.competitionId;
    this.divisionSelected = this.eventSelected.divisionList.find(x => +x.competitionId === +competitionId);
    this.subscriptions.push(this.tournamentService.getScorecard(this.eventSelected.scorecardId.toString()).subscribe(response => {
      if (response.status === 200) {
        this.eventSelected.scorecard = response.payload;
        this.getEventParticipants();
      } else {
        console.error(response);
      }
    }));
  }

  getParticipantNames(participant) {
    return this.scoringType === ScoringType.TEAM ? participant.teamMembers[0].fullName + ' & ' + participant.teamMembers[1].fullName : participant.fullName;
  }

  getParticipantDivision(participant) {
    return this.scoringType === ScoringType.TEAM ? participant.teamMembers[0].division : participant.division;
  }
  

}

interface TournamentParticipant {
  fullName: string,
  divisionName: string,
  year: number,
  memberId: number
}

export enum ScoringType {
  INDIVIDUAL = 'individual',
  TEAM = 'team'
}


import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Division } from '../models/Division';
import { Season } from '../models/Season';
import { Event } from '../models/Event';
import { GroupParticipant } from '../models/GroupParticipant';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HoleByHoleScoresComponent } from '../hole-by-hole-scores/hole-by-hole-scores.component';
import { MatTableDataSource } from '@angular/material/table';
import { ResultsService } from '../services/results.service';
import { EventDivision } from '../models/EventDivision';
import { MatInput } from '@angular/material/input';
import { ParticipantService } from '../services/participant.service';
import { HoleScore } from '../models/HoleScore';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';

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
  cutParticipants: any[] = [];
  dialogRef: MatDialogRef<any>;
  columns: string[];
  cutDataSource: MatTableDataSource<any>;
  searchDataSource: MatTableDataSource<any>;
  searchedParticipants: TournamentParticipant[];
  allParticipants: any[];
  searchColumns = ['name', 'eventName', 'year', 'division'];
  scoringType: ScoringType;
  rounds: Event[];
  masterRounds: Event[];
  results: Results;
  path: string;

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private resultsService: ResultsService,
    private participantService: ParticipantService,
    private dialog: MatDialog,
    private router: Router,
    private eventService: EventService
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
    this.path = this.router.url;
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
      this.season = response.payload;
      this.setLoadingPercent(40);
      this.getEvents();
    }));
  }

  /**
   * Get all events for the season
   */
  getEvents() {
    this.subscriptions.push(this.eventService.getAllEvents(this.season, true).subscribe(response => {
      this.events = response.payload;
      this.setLoadingPercent(80);
      this.getAllTournamentParticipants();
    }));
  }

  /*

  /**
   * Fetch all participants in the tournament season
   */
  getAllTournamentParticipants() {
    if (this.scoringType === ScoringType.TEAM) {
      this.getAllTeamsInSeason();
    } else {
      this.getAllIndividualsInSeason();
    }
  }

  getAllTeamsInSeason() {
    this.subscriptions.push(this.participantService.getTeamsBySeason(this.season.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.allParticipants = response.payload;
        console.log(this.allParticipants);
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
  }

  getAllIndividualsInSeason() {
    this.subscriptions.push(this.participantService.getIndividualsBySeason(this.season.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.allParticipants = response.payload;
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get the scorecard for the event
   */
  getScorecard(event: Event) {
    this.subscriptions.push(this.tournamentService.getScorecard(event.scorecardId.toString()).subscribe(response => {
      if (response.status === 200) {
        event.scorecard = response.payload;
        let allScorecardsSet = true;
        this.rounds.forEach(x => {
          if (!x.scorecard) {
            allScorecardsSet = false;
          }
        });
        if (allScorecardsSet === true) {
          this.getScores();
        }
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get the scores for current selected rounds of events.
   */
  getScores() {
    const eventIds: string[] = [];
    for (let round of this.rounds) {
      eventIds.push(round.id.toString());
    }
    this.subscriptions.push(this.resultsService.getScores(eventIds, this.scoringType, this.divisionSelected.competitionId.toString()).subscribe(response => {
      if (response.status === 200) {
        this.results = response.payload;
        console.log(this.results);
        this.setupParticipants();
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
    console.log(this.divisionSelected);
    this.setLoadingPercent(20);
    this.loadingPercent = 20;
    this.rounds = this.masterRounds.filter(round => round.divisionList.some(div => +div.competitionId === +this.divisionSelected.competitionId));
    this.rounds.sort((a, b) => {
      if (!(a.eventDate instanceof Date)) {
        const aDateParts = a.eventDate.split('-');
        a.eventDate = new Date(aDateParts[0], aDateParts[1] - 1, aDateParts[2].substr(0, 2));
      }
      if (!(b.eventDate !instanceof Date)) {
        const bDateParts = b.eventDate.split('-');
        b.eventDate = new Date(bDateParts[0], bDateParts[1] - 1, bDateParts[2].substr(0, 2));
      }
      return a.eventDate > b.eventDate ? 1 : a.eventDate < b.eventDate ? -1 : 0;
    });
    this.rounds.forEach(round => {
      this.getScorecard(round);
    });
    
  }
   
  setupParticipants() {
    this.setPos();
    this.setLoadingPercent(100);
  }

  /**
   * Set all participants positions in the scoring by score
   */
  setPos() {
    let index = 0;
    let posNum = 1;
    let currentTiePos;
    this.results.participants.forEach(x => {
      if (index !== 0) {
        const aboveTeam = this.results.participants[index - 1];
        if (aboveTeam) {
          if (+aboveTeam.finalScore === +x.finalScore) {
            currentTiePos = currentTiePos ? currentTiePos : posNum;
            x.pos = 'T' + (currentTiePos);
            aboveTeam.pos = 'T' + (currentTiePos);
            posNum += 1;
          } else {
            currentTiePos = null;
            posNum += 1;
            x.pos = posNum;
          }
        }
      } else {
        x.pos = posNum;
      }
      index += 1;
    });
  }

  sortScores() {
    const list = [];
    list.sort((a, b) => {
        if (a.roundScores.length === b.roundScores.length) {
          return a.totalScore - b.totalScore;
        }
        return a.roundScores.length < b.roundScores.length ? 1 : -1;
    });
  }

  /**
   * Show a dialog containing hole by hole scores for a participant
   * @param participant Group participant
   */
  showHoleByHole(participant) {
    const events = this.rounds;
    const eventScores: EventScore[] = [];
    this.results.eventScores.forEach(eventScore => {
      const scores = eventScore.scores.filter(x => +x.participantId === +participant.participantId);
      if (scores && scores.length > 0) {
        // filter the scores to only get the participant selected scores
        const participantScores: EventScore = { eventId: eventScore.eventId, name: eventScore.name, eventDate: eventScore.eventDate, courseName: eventScore.courseName, 
          courseShortName: eventScore.courseShortName, scores }
        eventScores.push(participantScores);
      }
    });
    this.dialogRef = this.dialog.open(HoleByHoleScoresComponent, { data: { eventScores, events, scoringType: this.scoringType }, minWidth: '100vw', minHeight: '100vh' })
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
    this.rounds = [];
    this.divisionSelected = null;
    this.masterRounds = [];
    this.getSeason();
  }

  onEventChange() {
    this.setLoadingPercent(25);
    this.setupRounds();
    this.divisionSelected = null;
    this.setLoadingPercent(100);
    if (this.eventSelected.divisionList.length === 1) {
      this.divisionSelected = this.eventSelected.divisionList[0];
      this.onDivisionChange();
    }
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
  
  /**
   * Find all the main events for the tournament season. Only those that have happend or are happnening so we can setup each as a 'round' of the tournament
   */
  setupRounds() {
    this.rounds = [];
    if (this.eventSelected.classification === 'main') {
      this.events.forEach(event => {
        const today = new Date(new Date(this.eventSelected.eventDate).setHours(0,0,0,0));
        console.log(today);
        let eventDate = event.eventDate;
        if (!(eventDate instanceof Date )) {
          const dateParts = eventDate.split('-');
          eventDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0, 2));
          console.log(eventDate);
        }
        if (event.classification === 'main' && eventDate <= today){
          this.rounds.push(event);
        }
      });
      if (this.rounds.some(round => round.id === this.eventSelected.id) === false) {
        this.rounds.push(this.eventSelected);
      }
    } else {
      this.rounds.push(this.eventSelected);
    }
    console.log(this.rounds);
    this.masterRounds = this.rounds;
  }

  getRoundScore(participant, event: Event): number {
    let round = participant.roundScores.find(roundScore => +roundScore.eventId === +event.id);
    return round && round.score ? round.score : null;
  }

  /**
   * Return text display version of round score result
   * @param participant 
   * @param event 
   */
  getRoundScoreText(participant: Participant, event: Event): string {
    const eventScores = this.results.eventScores.find(x => +x.eventId === +event.id);
    const scores = eventScores.scores.find(score => +score.participantId === +participant.participantId);
    if (scores && scores.holeScores.length > 8) {
      return +scores.total === 0 ? 'E' : +scores.total > 0 ? '+' + scores.total : scores.total.toString();
    } else {
      return null;
    }
  }

  getEventScorecard(eventId: number) {
    return this.rounds.find(round => +round.id === +eventId).scorecard;
  }

}

interface TournamentParticipant {
  fullName: string,
  divisionName: string,
  year: number,
  memberId: number
}

interface Results {
  participants: Participant[],
  eventScores: EventScore[];
}

interface Participant {
  participantId: number,
  members: any[],
  holesComplete: number,
  finalScore: number,
  pos: any
}

export interface EventScore {
  eventId: number,
  name: string,
  eventDate: any,
  courseName: string,
  courseShortName: string,
  scores: Score[]
}

interface Score {
  participantId: number,
  teamMembers: any[],
  scoreId: number,
  holeScores: HoleScore[],
  frontScore: number,
  backScore: number,
  total: number,
  holesComplete: number
}

export enum ScoringType {
  INDIVIDUAL = 'individual',
  TEAM = 'team'
}


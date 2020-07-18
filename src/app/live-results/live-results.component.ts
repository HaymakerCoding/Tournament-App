import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Division } from '../models/Division';
import { Season } from '../models/Season';
import { Event } from '../models/Event';
import { GroupParticipant } from '../models/GroupParticipant';
import { Scorecard } from '../models/Scorecard';

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

  divisions: Division[];
  validTournaments = [3]; // list of tournaments where live results are in place
  divisionSelected: Division;
  season: Season;
  events: Event[];
  groupsFetched = 0;
  divisionsSorted = 0;
  scorecardsFetched = 0;
  displayParticipants: GroupParticipant[];

  constructor(
    tournamentService: TournamentService,
    titleService: Title
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
    this.getDivisions();
  }

  getDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
        this.setLoadingPercent(30);
        this.getSeason();
      } else {
        console.error(response);
      }
    }));
  }

  getSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.id.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.setLoadingPercent(40);
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
        this.events.forEach(event => {this.getAllGroups(event)});
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
   */
  onDivisionSelected() {
    this.divisionsSorted = 0;
    this.events.forEach(event => {
      event.divisionParticipants = [];
      this.filterGroupsByDivision(event)
    });
  }

  filterGroupsByDivision(event: Event) {
    if (!event.divisionParticipants) {
      event.divisionParticipants = [];
    }
    event.groups.forEach(group => {
      group.groupParticipants.forEach(participant => {
        participant.divisions.forEach( division => {
          if (+division.id === +this.divisionSelected.id) {
            event.divisionParticipants.push(participant);
          }
        });
      });
    });
    // set the list shown to the participants of the first event, the first event should have the max num of participants
    this.displayParticipants = this.events[0].divisionParticipants;
    this.displayParticipants.forEach(participant => {
      participant.totalScore = this.getTotalScore(participant);
    });
    this.events.forEach(event => {
      this.setCurrentScore(event);
      this.sortScores(event);
    });
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
    if (event.divisionParticipants) {
      event.divisionParticipants.forEach(participant => {
        participant.score = this.getScore(participant, this.getHoleComplete(participant), event.scorecard);
      });
    }
  }

  sortScores(event: Event) {
    if (event.divisionParticipants) {
      event.divisionParticipants.sort((a, b) => {
        return a.score - b.score;
      });
    }
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
   * Get the user's TOTAL score across all events
   */
  getTotalScore(participant: GroupParticipant) {
    let totalScore = 0;
    this.events.forEach(event => {
      if (event.divisionParticipants) {
        const participantFound: GroupParticipant = event.divisionParticipants.find(x => +x.memberId === +participant.memberId);
        if (participantFound && participantFound.score) {
          totalScore += +participantFound.score;
        }
      }
    });
    return totalScore;
  }

  

}

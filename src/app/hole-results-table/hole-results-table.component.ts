import { Component, OnInit, Input } from '@angular/core';
import { Event } from '../models/Event';
import { ScoringType } from '../live-results/live-results.component';
import { HoleScore } from '../models/HoleScore';
import { Team } from '../models/Team';
import { Individual } from '../models/Individual';

@Component({
  selector: 'app-hole-results-table',
  templateUrl: './hole-results-table.component.html',
  styleUrls: ['./hole-results-table.component.scss']
})
export class HoleResultsTableComponent implements OnInit {

  @Input() event: Event;
  @Input() scoringType: ScoringType;
  @Input() teams: Team[];
  @Input() individuals: Individual[];

  holeColumns = [];
  parColumns = [];
  columns: string[] = ['name'];

  constructor() { }

  ngOnInit(): void {
    this.initializeColumns();
  }

  initializeColumns() {
    const lastHole = this.event.scorecard.scorecardHoles[this.event.scorecard.scorecardHoles.length - 1].no;
    this.holeColumns.push('hole');
    this.event.scorecard.scorecardHoles.forEach(hole => {
      this.holeColumns.push('h'+hole.no);
      if (+hole.no === 9) {
        this.holeColumns.push('front');
      }
      if (+hole.no === 18) {
        this.holeColumns.push('back');
      }
      if (+hole.no === +lastHole) {
        this.holeColumns.push('total')
        this.holeColumns.push('finalScore');
      }
    });
    this.parColumns.push('par');
    
    this.event.scorecard.scorecardHoles.forEach(hole => {
      this.parColumns.push('p'+hole.no);
      this.columns.push(hole.no.toString());
      if (+hole.no === 9) {
        this.parColumns.push('frontTotal');
        this.columns.push('frontTotalP');
      }
      if (+hole.no === 18) {
        this.parColumns.push('backTotal');
        this.columns.push('backTotalP');
        
      }
      if (+hole.no === +lastHole) {
        this.columns.push('playerTotal');
        this.columns.push('scoreToPar');
        this.parColumns.push('parTotal');
        this.parColumns.push('parSpacer');
      }
    });
  }

  getDatasource(event: Event) {
    return this.scoringType === ScoringType.TEAM ? this.teams : this.individuals;
  }

  /**
   * Get score on current hole for a participant
   * @param participant Group participant
   */
  getHoleScore(participant, hole: number): number {
    const holeScore: HoleScore = participant.holeScores.find(x => +x.hole === +hole);
    return holeScore && holeScore.id ? holeScore.score : null;
  }

  getFrontParTotal(event: Event) {
    let total = 0;
    event.scorecard.scorecardHoles.forEach(hole => {
      if (+hole.no < 10) {
        total += +hole.par;
      }
    });
    return total;
  }

  getBackParTotal(event: Event) {
    let total = 0;
    event.scorecard.scorecardHoles.forEach(hole => {
      if (+hole.no >= 10) {
        total += +hole.par;
      }
    });
    return total;
  }

  /**
   * Get players total for the Back 9 holes (10-18)
   * @param participant Group Participant
   */
  getPlayerBackTotal(participant) {
    let total = 0;
    participant.holeScores.forEach(holeScore => {
      if (+holeScore.hole >= 10) {
        total += +holeScore.score;
      }
    });
    return total;
  }

  /**
   * Get the players total for the Front 9 holes (1-9)
   * @param participant Group participant
   */
  getPlayerFrontTotal(participant) {
    let total = 0;
    participant.holeScores.forEach(holeScore => {
      if (+holeScore.hole < 10) {
        total += +holeScore.score;
      }
    });
    return total;
  }

  /**
   * Return par total for the event scorecard
   * @param event Event played
   */
  getParTotal(event: Event) {
    let total = 0;
    event.scorecard.scorecardHoles.forEach(scorecardHole => {
      total += +scorecardHole.par;
    });
    return total;
  }

  /**
   * Return the participants final score on the scorecard
   * @param participant Group Participant
   */
  getFinalScore(participant) {
    return this.getPlayerBackTotal(participant) + this.getPlayerFrontTotal(participant);
  }

  getParticipantNames(participant) {
    return this.scoringType === ScoringType.TEAM ? participant.teamMembers[0].fullName + ' & ' + participant.teamMembers[1].fullName : participant.fullName;
  }

  getScoreToPar(participant) {
    let target = 0;
    let score = 0;
    participant.holeScores.forEach(holeScore => {
      if (holeScore.score) {
        score += +holeScore.score;
        target += +this.event.scorecard.scorecardHoles.find(x => +x.no === +holeScore.hole).par;
      }
    });
    const finalScore: number = +score - +target;
    return finalScore === 0 ? 'Even' : finalScore > 0 ? '+' + finalScore : finalScore; 
  }

  isBirdie(score, hole) {
    const par: number = +this.event.scorecard.scorecardHoles.find(x => +x.no === +hole).par;
    return par - +score === 1;
  }
  isEagle(score, hole) {
    const par: number = +this.event.scorecard.scorecardHoles.find(x => +x.no === +hole).par;
    return par - +score === 2;
  }
  isAlbatross(score, hole) {
    const par: number = +this.event.scorecard.scorecardHoles.find(x => +x.no === +hole).par;
    return par - +score === 3 && score && score !== 0;
  }
  isBogie(score, hole) {
    const par: number = +this.event.scorecard.scorecardHoles.find(x => +x.no === +hole).par;
    return par - +score === -1;
  }
  isDoubleBogie(score, hole) {
    const par: number = +this.event.scorecard.scorecardHoles.find(x => +x.no === +hole).par;
    return par - +score === -2;
  }

}

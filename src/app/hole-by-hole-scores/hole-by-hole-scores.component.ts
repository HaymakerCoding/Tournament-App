import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { GroupParticipant } from '../models/GroupParticipant';
import { Event } from '../models/Event';
import { HoleScore } from '../models/HoleScore';

/**
 * Hole by hole scores for each event passed in, for the participant passed in.
 * Give a table of all holes and pars with the participant scores for each.
 * This component is shown in a model opened from parent component
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-hole-by-hole-scores',
  templateUrl: './hole-by-hole-scores.component.html',
  styleUrls: ['./hole-by-hole-scores.component.scss']
})
export class HoleByHoleScoresComponent implements OnInit {

  events: Event[];
  participant: GroupParticipant;
  holeColumns = [];
  parColumns = [];
  columns: string[] = ['name'];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<HoleByHoleScoresComponent>
  ) { }

  ngOnInit(): void {
    this.events = this.data.events;
    this.participant = this.data.participant;
    this.holeColumns.push('hole');
    this.events[0].scorecard.scorecardHoles.forEach(hole => {
      this.holeColumns.push('h'+hole.no);
      if (+hole.no === 9) {
        this.holeColumns.push('front');
      }
      if (+hole.no === 18) {
        this.holeColumns.push('back');
        this.holeColumns.push('total')
      }
    });
    this.parColumns.push('par');
    this.events[0].scorecard.scorecardHoles.forEach(hole => {
      this.parColumns.push('p'+hole.no);
      this.columns.push(hole.no.toString());
      if (+hole.no === 9) {
        this.parColumns.push('frontTotal');
        this.columns.push('frontTotalP');
      }
      if (+hole.no === 18) {
        this.parColumns.push('backTotal');
        this.parColumns.push('parTotal');
        this.columns.push('backTotalP');
        this.columns.push('playerTotal');
      }
    });
  }

  getDatasource(event: Event) {
    let eventParticipants: GroupParticipant[] = [];
    event.groups.forEach(group => {
      group.groupParticipants.forEach(p => {
        if (p.memberId === this.participant.memberId) {
          eventParticipants.push(p);
        }
      });
    });
    if (eventParticipants[0]) {
      return eventParticipants;
    }
  }

  /**
   * Get score on current hole for a participant
   * @param participant Group participant
   */
  getHoleScore(participant: GroupParticipant, hole: number): number {
    const holeScore: HoleScore = participant.holeScores.find(x => +x.hole === +hole);
    return holeScore && holeScore.id ? holeScore.score : null;
  }

  close() {
    this.dialogRef.close();
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
  getPlayerBackTotal(participant: GroupParticipant) {
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
  getPlayerFrontTotal(participant: GroupParticipant) {
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
  getFinalScore(participant: GroupParticipant) {
    return this.getPlayerBackTotal(participant) + this.getPlayerFrontTotal(participant);
  }


}

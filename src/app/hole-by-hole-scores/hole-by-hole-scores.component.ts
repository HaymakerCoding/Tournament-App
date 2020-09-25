import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Event } from '../models/Event';
import { EventScore } from '../past-results/past-results.component';
import { ScoringType } from '../models/ScoringType';

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

  rounds: Event[];
  eventScores: EventScore[];
  scoringType: ScoringType;
  participant: any;
  loading: boolean;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this.rounds = this.data.events;
    this.scoringType = this.data.scoringType;
    this.eventScores = this.data.eventScores;
    this.loading = false;
  }

  getEventScorecard(event: EventScore) {
    return this.rounds.find(x => +x.id === +event.eventId).scorecard;
  }

  getEvent(event: EventScore) {
    return this.rounds.find(x => +x.id === +event.eventId);
  }

  close() {
    this.dialogRef.close();
  }

  



}

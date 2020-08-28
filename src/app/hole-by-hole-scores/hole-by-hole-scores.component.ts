import { Component, OnInit, Inject, Input } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Event } from '../models/Event';
import { HoleScore } from '../models/HoleScore';
import { Team } from '../models/Team';
import { Individual } from '../models/Individual';
import { ScoringType } from '../live-results/live-results.component';
import { Scorecard } from '../models/Scorecard';

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
  event: Event;
  teams: Team[];
  individuals: Individual[];
  scoringType: ScoringType;
  participant: any;
  loading: boolean;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this.events = this.data.events;
    this.event = this.events[0];
    this.teams = this.data.teams;
    this.individuals = this.data.individuals;
    this.scoringType = this.data.scoringType;
    
    this.loading = false;
  }

  

  close() {
    this.dialogRef.close();
  }

  



}

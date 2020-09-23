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

  constructor(
    tournamentService: TournamentService,
    titleService: Title) 
  {
    super(tournamentService, titleService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  next() {
    this.setLoadingPercent(100);
  }

  
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Tournament } from '../models/Tournament';
import { Subscription } from 'rxjs';
import { TournamentBase } from '../tournamentBase';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent extends TournamentBase implements OnInit, OnDestroy {

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
    this.setLoadingPercent(100);
  }

}

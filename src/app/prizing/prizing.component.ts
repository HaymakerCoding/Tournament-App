import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-prizing',
  templateUrl: './prizing.component.html',
  styleUrls: ['./prizing.component.scss']
})
export class PrizingComponent implements OnInit, OnDestroy {

  loading: boolean;
  subscriptions: Subscription[] = [];

  @Input() tournament: Tournament;
  constructor(
    private tournamentService: TournamentService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getTournament();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name);
        this.loading = false;
      }));
    } else {
      this.loading = false;
    }
  }

}

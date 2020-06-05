import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from '../models/Tournament';
import { Title } from '@angular/platform-browser';
import { TournamentRules } from '../models/TournamentRules';
import { Rule } from '../models/Rule';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit, OnDestroy {

  @Input() tournament: Tournament;
  subscriptions: Subscription[] = [];
  loading: boolean;
  tournamentRules: TournamentRules[];
  globalRules: Rule[];

  constructor(
    private tournamentService: TournamentService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getTournament();
  }

  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name);
        this.getGlobalRules();
      }));
    } else {
      this.getGlobalRules();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getGlobalRules() {
    this.subscriptions.push(this.tournamentService.getGlobalRules().subscribe(response => {
      if (response.status === 200) {
        this.globalRules = response.payload;
      } else {
        console.error(response);
      }
      this.getRules();
    }));
  }

  getRules() {
    this.subscriptions.push(this.tournamentService.getAllRulesByTournament(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.tournamentRules = response.payload;
      } else {
        console.error(response);
      }
      this.loading = false;
    }));
  }

}

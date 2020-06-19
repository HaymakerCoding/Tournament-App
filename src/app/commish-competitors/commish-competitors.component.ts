import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Tournament } from '../models/Tournament';
import { CommishService } from '../services/commish.service';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Team } from '../models/Team';

@Component({
  selector: 'app-commish-competitors',
  templateUrl: './commish-competitors.component.html',
  styleUrls: ['./commish-competitors.component.scss']
})
export class CommishCompetitorsComponent implements OnInit, OnDestroy {

  @Input() tournament: Tournament;
  subscriptions: Subscription[] = [];
  years: number[];
  yearSelected: number;
  loadingPercent: number;
  STteams: Team[];
  guestTeams: Team[];
  teamShown: number;

  constructor(
    private commishService: CommishService,
    private tournamentService: TournamentService
  ) { }

  ngOnInit(): void {
    this.setTeamShown(1);
    this.getYears();
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setTeamShown(num: number) {
    this.teamShown = num;
  }

  setLoadingPercent(percent) {
    this.loadingPercent = percent;
  }

  getYears() {
    this.subscriptions.push(this.tournamentService.getYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.years = response.payload;
        this.yearSelected = this.years[0];
        this.setLoadingPercent(20);
        this.getSTteams();
      } else {
        console.error(response);
      }
    }));
  }

  getSTteams() {
    this.subscriptions.push(this.commishService.getSTteams(this.yearSelected.toString()).subscribe(response => {
      if (response.status === 200) {
        this.STteams = response.payload;
        this.setLoadingPercent(40);
        this.getGuestTeams();
      } else {
        console.error(response);
      }
    }));
  }

  getGuestTeams() {
    this.guestTeams = [];
    this.setLoadingPercent(100);
  }

  onYearChange() {
    this.setLoadingPercent(20);
    this.getSTteams();
  }

}

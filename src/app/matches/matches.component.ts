import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Season } from '../models/Season';
import { Event } from '../models/Event';
import { Router } from '@angular/router';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent extends TournamentBase implements OnInit {

  season: Season;
  events: Event[];

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private router: Router
  ) {
    super(tournamentService, titleService);
   }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  next() {
    this.titleService.setTitle(this.tournament.name);
    this.getCurrentSeason();
  }

  /**
   * Get the tournaments Current Season by year
   */
  getCurrentSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.id.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.setLoadingPercent(30);
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
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
  }

  goToDraw(event: Event) {
    this.router.navigate(['/matches/' + event.id]);
  }

}

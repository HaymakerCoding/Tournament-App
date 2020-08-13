import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { Title } from '@angular/platform-browser';
import { TournamentService } from '../services/tournament.service';
import { Season } from '../models/Season';
import { Event } from '../models/Event';

@Component({
  selector: 'app-qualifiers',
  templateUrl: './qualifiers.component.html',
  styleUrls: ['./qualifiers.component.scss']
})
export class QualifiersComponent extends TournamentBase implements OnInit {

  season: Season;
  events: Event[];

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
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
    this.getSeason();
  }

  getSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.setLoadingPercent(25);
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

}

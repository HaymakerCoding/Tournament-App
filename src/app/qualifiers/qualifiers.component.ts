import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { Title } from '@angular/platform-browser';
import { TournamentService } from '../services/tournament.service';
import { Season } from '../models/Season';
import { Event, Classification } from '../models/Event';

@Component({
  selector: 'app-qualifiers',
  templateUrl: './qualifiers.component.html',
  styleUrls: ['./qualifiers.component.scss']
})
export class QualifiersComponent extends TournamentBase implements OnInit {

  season: Season;
  events: Event[];
  url: string;

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
    this.url = window.location.href;
    this.getSeason();
  }

  getSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.setLoadingPercent(25);
        if (this.url.includes('/event/par-3')) {
          this.getEvents(Classification.EXHIBITION);
        } else {
          this.getEvents(Classification.QUALIFIER);
        }
      } else {
        console.error(response);
      }
    }));
  }

  getEvents(classification: Classification) {
    this.subscriptions.push(this.tournamentService.getAllEventsByClassification(this.season, classification).subscribe(response => {
      if (response.status === 200) {
        this.events = response.payload;
        // if this component is loaded VIA the route below then we want to specifically load just that 1 special event
        if (this.url.includes('/event/par-3')) {
          this.events = this.events.filter(x => x.name.includes('Par-3'));
        }
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
  }

  isUpcomingEvent(event: Event) {
    return (new Date(event.eventDate)) >= new Date();
  }

}

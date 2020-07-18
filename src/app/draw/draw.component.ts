import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Event } from '../models/Event';
import { Group } from '../models/Group';
import { Tournament } from '../models/Tournament';
import { Title } from '@angular/platform-browser';
import { Season } from '../models/Season';

/**
 * Display the groups/tee times schedule for an event
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit, OnDestroy {

  eventSelected: Event;
  eventSelectedId: number;
  groups: Group[];
  tournament: Tournament;
  season: Season;
  events: Event[];
  loadingPercent: number;
  subscriptions: Subscription[] = [];

  constructor(
    private tournamentService: TournamentService,
    private titleService: Title,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getTournament();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setLoadingPercent(percent: number) {
    this.loadingPercent = percent;
  }

  /**
   * Basic data pull of tournament based on host url. Gives us the tournament we are dealing with.
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.tournament.id = +this.tournament.id;
        this.titleService.setTitle(this.tournament.name);
        this.setLoadingPercent(10);
        this.getCurrentSeason();
      }));
    } else {
      this.setLoadingPercent(10);
      this.getCurrentSeason();
    }
  }

  /**
   * Get the tournaments Current Season by year
   */
  getCurrentSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.id.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.setLoadingPercent(20);
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
        this.setLoadingPercent(30);
        this.getEventId();
      } else {
        console.error(response);
      }
    }));
  }

  getEventId() {
    this.activeRoute.params.subscribe((params: { eventId: string }) => {
      const eventId = params.eventId;
      if (eventId) {
        this.getEvent(eventId);
        this.eventSelectedId = +eventId;
      } else {
        this.getEvent(this.events[0].id.toString());
        this.eventSelectedId = +this.events[0].id;
      }
    });
  }

  getEvent(eventId: string) {
    this.subscriptions.push(this.tournamentService.getEvent(eventId).subscribe(response => {
      if (response.status === 200) {
        this.eventSelected = response.payload;
        this.setLoadingPercent(40);
        this.getGroups();
      } else {
        console.error(response);
      }
    }));
  }

  getGroups() {
    this.subscriptions.push(this.tournamentService.getGroups(this.eventSelected.id.toString(), this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.groups = response.payload;
        this.setLoadingPercent(100);
      } else {
        console.error(response);
        this.groups[0]
      }
    }));
  }

  /**
   * On User changing the event selected.
   * Clear data for event and groups and refetch from db
   * @param eventId ID of Event selected
   */
  onEventChange(eventId: number) {
    this.eventSelected = null;
    this.groups = [];
    this.setLoadingPercent(20);
    this.getEvent(eventId.toString());
  }


}

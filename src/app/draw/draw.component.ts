import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Event } from '../models/Event';
import { Group } from '../models/Group';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit, OnDestroy {

  susbscriptions: Subscription[] = [];
  event: Event;
  loadingPercent: number;
  groups: Group[];

  constructor(
    private activeRoute: ActivatedRoute,
    private tournamentService: TournamentService
  ) { }

  ngOnInit(): void {
    this.getEventId();
  }

  ngOnDestroy() {
    this.susbscriptions.forEach(x => x.unsubscribe());
  }

  setloadingPercent(percent: number) {
    this.loadingPercent = percent;
  }

  getEventId() {
    this.activeRoute.params.subscribe((params: { eventId: string }) => {
      const eventId = params.eventId;
      this.getEvent(eventId);
      this.setloadingPercent(20);
    });
  }

  getEvent(eventId: string) {
    this.susbscriptions.push(this.tournamentService.getEvent(eventId).subscribe(response => {
      if (response.status === 200) {
        this.event = response.payload;
        this.setloadingPercent(40);
        this.getGroups();
      } else {
        console.error(response);
      }
    }));
  }

  getGroups() {
    this.susbscriptions.push(this.tournamentService.getGroups(this.event.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.groups = response.payload;
        this.setloadingPercent(100);
      } else {
        console.error(response);
        this.groups[0]
      }
    }));
  }


}

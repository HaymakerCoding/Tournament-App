import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Season } from '../models/Season';
import { Event } from '../models/Event';
import { ActivatedRoute, Params } from '@angular/router';
import { EventParticipant } from '../models/EventParticipant';
import { TeamEventParticipant } from '../models/TeamEventParticipant';

@Component({
  selector: 'app-event-competitors',
  templateUrl: './event-competitors.component.html',
  styleUrls: ['./event-competitors.component.scss']
})
export class EventCompetitorsComponent  extends TournamentBase implements OnInit {

  season: Season;
  event: Event;
  eventParticipants: EventParticipant[] = [];
  teamEventParticipants: TeamEventParticipant[] = [];

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private activatedRoute: ActivatedRoute
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
      this.getId();
    }

    getId() {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.getEvent(params.id);
      })
    }

    getEvent(id: string) {
      this.subscriptions.push(this.tournamentService.getEvent(id).subscribe(response => {
        if (response.status === 200) {
          this.event = response.payload;
          this.setLoadingPercent(50);
          this.getEventCompetitors();
        } else {
          console.error(response);
        }
      }));
    }

    getSeason() {
      const year = new Date().getFullYear();
      this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), year.toString()).subscribe(response => {
        if (response.status === 200) {
          this.season = response.payload;
          this.setLoadingPercent(25);
          this.getEventCompetitors();
        } else {
          console.error(response);
        }
      }));
    }

    getEventCompetitors() {
      this.subscriptions.push(this.tournamentService.getEventParticipants(this.event.id.toString(), 'individual').subscribe(response => {
        if (response.status === 200) {
          this.eventParticipants = response.payload;
          this.setLoadingPercent(60);
          this.subscriptions.push(this.tournamentService.getEventParticipants(this.event.id.toString(), 'pair').subscribe(response2 => {
            if (response2.status === 200) {
              this.teamEventParticipants = response2.payload;
              this.setLoadingPercent(100);
            } else {
              console.error(response2);
            }
          }));
        } else {
          console.error(response);
        }
      }));
    }

    getDivParticipants(competitionId: number) {
      const participants = [];
      this.teamEventParticipants.forEach(team => {
        if (+team.eventParticipants[0].competitionId === +competitionId) {
          participants.push(team);
        }
      });
      return participants;
    }

}

import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Season } from '../models/Season';
import { Event } from '../models/Event';
import { ActivatedRoute, Params } from '@angular/router';
import { EventParticipant } from '../models/EventParticipant';
import { TeamEventParticipant } from '../models/TeamEventParticipant';
import { ScoringType } from '../live-results/live-results.component';
import { Individual } from '../models/Individual';
import { Team } from '../models/Team';

@Component({
  selector: 'app-event-competitors',
  templateUrl: './event-competitors.component.html',
  styleUrls: ['./event-competitors.component.scss']
})
export class EventCompetitorsComponent  extends TournamentBase implements OnInit {

  season: Season;
  event: Event;
  individuals: Individual[] = [];
  teams: Team[] = [];
  scoringType: ScoringType;

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
      this.setScoringType();
      this.getId();
    }

    setScoringType() {
      switch (+this.tournament.eventTypeId) {
        case 1: {
          this.scoringType= ScoringType.TEAM;
          break;
        }
        case 3: {
          this.scoringType = ScoringType.INDIVIDUAL;
          break;
        }
        default: {
          console.error('Error - scoring type not set for this event type');
          break;
        }
      }
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
      this.subscriptions.push(this.tournamentService.getEventParticipants(this.event.id.toString(), this.scoringType).subscribe(response => {
        if (response.status === 200) {
          if (this.scoringType === ScoringType.TEAM) {
            this.teams = response.payload;
          } else {
            this.individuals = response.payload;
          }
        } else {
          console.error(response);
        }
      }));
    }

    getDivParticipants(competitionId: number) {
      const participants = [];
      this.teams.forEach(team => {
        if (+team.teamMembers[0].competitionId === +competitionId) {
          participants.push(team);
        }
      });
      return participants;
    }

}

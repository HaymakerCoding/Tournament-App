import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Event } from '../models/Event';
import { Group } from '../models/Group';
import { Tournament } from '../models/Tournament';
import { Title } from '@angular/platform-browser';
import { Season } from '../models/Season';
import { EventService } from '../services/event.service';
import { ParticipantService } from '../services/participant.service';
import { ScoringType } from '../models/ScoringType';
import { TournamentBase } from '../tournamentBase';
import { GroupParticipant } from '../models/GroupParticipant';

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
export class DrawComponent extends TournamentBase implements OnInit, OnDestroy {

  eventSelected: Event;
  eventSelectedId: number;
  groups: Group[];
  tournament: Tournament;
  season: Season;
  events: Event[];
  loadingPercent: number;
  subscriptions: Subscription[] = [];
  allParticipants: any[];
  scoringType: ScoringType;

  constructor(
    protected tournamentService: TournamentService,
    protected titleService: Title,
    private activeRoute: ActivatedRoute,
    private eventService: EventService,
    private participantService: ParticipantService
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
    this.tournament.id = +this.tournament.id;
    this.titleService.setTitle('Tee Times');
    this.setScoringType();
    this.setLoadingPercent(10);
    this.getCurrentSeason();
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
      case 6: {
        this.scoringType = ScoringType.INDIVIDUAL;
        break;
      }
      default: {
        console.error('Error - scoring type not set for this event type' + this.tournament.eventTypeId);
        break;
      }
    }
  }

  /**
   * Get the tournaments Current Season by year
   */
  getCurrentSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), year.toString()).subscribe(response => {
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
    this.subscriptions.push(this.eventService.getGroups(this.eventSelected.id.toString()).subscribe(response => {
      this.groups = response.payload;
      this.setLoadingPercent(60);
      this.getParticipants();
      console.log(this.groups);
    }));
  }

  /**
   * Fetch all participants in the event
   */
  getParticipants() {
    if (this.scoringType === ScoringType.TEAM) {
      this.getEventTeams();
    } else {
      this.getEventIndividuals();
    }
  }

  getEventTeams() {
    this.subscriptions.push(this.participantService.getTeamsByEvent(this.eventSelected.id.toString()).subscribe(response => {
      this.allParticipants = response.payload;
      this.setLoadingPercent(100);
    }));
  }

  getEventIndividuals() {
    this.subscriptions.push(this.participantService.getEventParticipants(this.eventSelected.id.toString()).subscribe(response => {
      this.allParticipants = response.payload;
      this.setLoadingPercent(100);
    }));
  }

  /**
   * Return a property of the participant or participants(pair), for the group participant
   * @param groupParticipant Group Participant (team or individual)
   */
  getParticipantProperty(groupParticipant: GroupParticipant, index: number, property: string) {
    const participant = this.allParticipants.find(x => +x.participantId === +groupParticipant.participantId);
    if ((participant && this.scoringType === ScoringType.INDIVIDUAL) || (participant && this.scoringType === ScoringType.TEAM && participant.teamMembers[index])) {
      if (property === 'fullName') {
        return this.scoringType === ScoringType.TEAM ? participant.teamMembers[index].fullName : participant.fullName;
      } else if (property === 'division') {
        return this.scoringType === ScoringType.TEAM ? participant.teamMembers[index].division : participant.division;
      }
    } else {
      return null;
    }
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

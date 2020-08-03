import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RegistrationService } from '../services/registration.service';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Division } from '../models/Division';
import { Season } from '../models/Season';

@Component({
  selector: 'app-all-competitors',
  templateUrl: './all-competitors.component.html',
  styleUrls: ['./all-competitors.component.scss']
})
export class AllCompetitorsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  loading: boolean;
  tournament: Tournament;
  divisions: Division[];
  leftList: Division[] = [];
  centerList: Division[] = [];
  rightList: Division[] = [];
  season: Season;

  constructor(
    private regService: RegistrationService,
    private tournamentService: TournamentService,
    private titleService: Title,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getTournament();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * First Step - Get ALL data for this tournament page. Fetch by host.
   * Service should be a singleton and return existing data if any or fetch the data
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name + ' Divisions');
        this.getSeason()
      }));
    } else {
      this.getSeason();
    }
  }

  getSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.getDivisions();
      } else {
        console.error(response);
      }
    }));
  }


  /**
   * Initialize the division available to play.
   * User can select these for sending with their registration
   * chosen boolean starts false and true if selected by user
   */
  getDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.season).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
      } else {
        alert('Sorry, there was an error getting the division list');
        console.error(response);
      }
      this.initDivisionLists();
    }));
  }

  /**
   * Break the divisions into 3 columns for display purposes
   */
  initDivisionLists() {
    const firstPoint = this.divisions.length * 0.33;
    const secondPoint = this.divisions.length * 0.66;
    let num = 0;
    for (const div of this.divisions) {
      if (num < firstPoint) {
        this.leftList.push(div);
      } else if (num < secondPoint) {
        this.centerList.push(div);
      } else {
        this.rightList.push(div);
      }
      num++;
    }
    this.loading = false;
  }

}


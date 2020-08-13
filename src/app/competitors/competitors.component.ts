import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RegistrationService } from '../services/registration.service';
import { Division } from '../models/Division';
import { RegistrationBasic } from '../models/RegistrationBasic';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from '../models/Tournament';
import { TournamentYearlyData } from '../models/TournamentYearlyData';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Season } from '../models/Season';

@Component({
  selector: 'app-competitors',
  templateUrl: './competitors.component.html',
  styleUrls: ['./competitors.component.scss']
})
export class CompetitorsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  divisions: Division[];
  registrations: RegistrationBasic[] = [];
  waitingRegistrations: RegistrationBasic[] = [];
  matchingRegistrations: RegistrationBasic[]; // for sort results by division selected
  matchingWaitRegistrations: RegistrationBasic[]; // for sort results by division selected for WAITING regitrants
  tournament: Tournament;
  loading: boolean;
  divSelected: Division;
  divisionId: number;
  season: Season;

  constructor(
    private regService: RegistrationService,
    private tournamentService: TournamentService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getId();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getId() {
    this.activatedRoute.params.subscribe((params: {id: string}) => {
      this.divisionId  = +params.id;
      this.getTournament();
    });
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
        this.titleService.setTitle(this.tournament.name + ' Competitor List');
        this.getSeason();
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

  filterMembers(div) {
    if (div === 0) {
      const allReg = this.registrations.filter(x => x.status !== 'bailed');
      this.matchingRegistrations = allReg;
      this.matchingWaitRegistrations = this.waitingRegistrations;
    } else {
      this.matchingRegistrations = this.registrations.filter(reg => {
        if (+reg.divisionId === +this.divSelected.id && reg.status !== 'bailed') {
          return reg;
        }
      });
      this.matchingWaitRegistrations = this.waitingRegistrations.filter(reg => {
        if (reg.divisionId === div.id) {
          return reg;
        }
      });
    }
  }

  getDisplayNames(i, reg: RegistrationBasic ) {
    if (reg.partnerId) {
      return ( i + 1 ) + '. ' + reg.fullName + ' & ' + reg.partnerFullName;
    } else {
      return ( i + 1 ) + '. ' + reg.fullName;
    }
  }

  getEmptySpots(numRegistered, maxSpots, reservedSpots) {
    const spots = [];
    for (let x = numRegistered + 1; x <= (maxSpots - reservedSpots); x++) {
      spots.push(x);
    }
    return spots;
  }

  getReservedSpots(reservedSpots) {
    const reserved = [];
    for (let x = 1; x <= reservedSpots; x++) {
      reserved.push(x);
    }
    return reserved;

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
        this.divSelected = this.divisions.find(x => +x.id === +this.divisionId);
        this.getRegistrations();
      } else {
        alert('Sorry, there was an error getting the division list');
        console.error(response);
      }
    }));
  }

  /**
   * Check whether there are registration for a specific division.
   * @param division Division obj
   */
  hasRegistrations(division: Division): boolean {
    let has = false;
    this.registrations.forEach(x => {
      if (x.divisionId === division.id) {
        has = true;
      }
    });
    return has;
  }

  /**
   * Check that a registration matches a division
   * @param reg Registration record
   * @param div Division obj
   */
  checkDiv(reg: RegistrationBasic) {
    if (this.divSelected instanceof Division) {
      const div: Division = this.divSelected;
      return reg.divisionId === div.id;
    } else {
      return false;
    }
  }

  getRegistrations() {
    this.subscriptions.push(this.regService.getAll(this.tournament.id.toString(), this.season.year.toString()).subscribe(response => {
      if (response.status === 200) {
        const fullReg: RegistrationBasic[] = response.payload;
        // seperate registered from waiting, 'waiting' status means no spots were available when they registered
        fullReg.forEach( x => {
          if (x.status === 'registered') {
            this.registrations.push(x);
          } else if (x.status === 'waiting') {
            this.waitingRegistrations.push(x);
          }
        });
        this.registrations.sort(this.sortRegByName);
        this.waitingRegistrations.sort(this.sortRegByName);
        this.matchingRegistrations = this.registrations;
        this.matchingWaitRegistrations = this.waitingRegistrations;
        this.filterMembers(this.divSelected);
      } else {
        alert('Sorry there was an error fetching registrations. Please try back later.');
        console.error(response);
      }
      this.loading = false;
    }));
  }

  /**
   * Sorting the Registrations to order by name
   * @param a Reg obj to compare
   * @param b Reg obj to compare
   */
  sortRegByName(a: RegistrationBasic, b: RegistrationBasic) {
    if (a.fullName < b.fullName) {
      return -1;
    } else if (a.fullName > b.fullName) {
      return 1;
    } else {
      return 0;
    }
  }

}



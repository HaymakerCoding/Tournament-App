import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RegistrationService } from '../services/registration.service';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Division } from '../models/Division';
import { Router, ActivatedRoute } from '@angular/router';
import { TournamentChamp } from '../models/TournamentChamp';
import { TournamentSponsor } from '../models/TournamentSponsor';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.scss']
})
export class DivisionComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  loading: boolean;
  tournament: Tournament;
  divisions: Division[];
  divSelected: Division;
  years: number[];
  allChamps: TournamentChamp[];
  divisionId: number;
  sponsor: TournamentSponsor;
  allSponsors: TournamentSponsor[];
  onPhone: boolean;

  constructor(
    private regService: RegistrationService,
    private tournamentService: TournamentService,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit() {
    this.loading = true;
    this.initBreakObserver();
    this.getId();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Listen to screen size changes, for setting phone specific settings like nav background image
   */
  initBreakObserver() {
    this.breakpointObserver.observe(
      ['(max-width: 800px)']).subscribe(result => {
        if (result.matches) {
          this.onPhone = true;
        } else {
          this.onPhone = false;
        }
      });
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
        this.titleService.setTitle(this.tournament.name + ' Divisions');
        this.getYears();
      }));
    } else {
      this.getYears();
    }
  }

  getYears() {
    this.subscriptions.push(this.tournamentService.getYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.years = response.payload;
      } else {
        console.error(response);
      }
      this.getDivisions();
    }));
  }

  /**
   * Return the division champ for a year. Return both names if partner is assigned
   * @param divId Division ID
   * @param year 4 digit year
   */
  getChamp(divId, year) {
    const champ = this.allChamps.find(x => +x.divisionId === +divId && +x.tournamentYear === +year && x.type === 'champion');
    if (champ) {
      return champ.partnerId ? champ.fullName + ' & ' + champ.partnerName : champ.fullName;
    } else {
      return 'None';
    }
  }

  /**
   * Return the division champ winning pic for a year
   * @param divId Division ID
   * @param year 4 digit year
   */
  getChampPic(divId, year) {
    const champ = this.allChamps.find(x => +x.divisionId === +divId && +x.tournamentYear === +year && x.type === 'champion');
    return champ ? champ.pic : null;
  }

  getRunnerUp(divId, year) {
    const champ = this.allChamps.find(x => +x.divisionId === +divId && +x.tournamentYear === +year && x.type === 'runner-up');
    if (champ) {
      return champ.partnerId ? champ.fullName + ' & ' + champ.partnerName + ' (Runner-ups)' : champ.fullName + ' (Runner-up)';
    } else {
      return 'None';
    }
  }

  /**
   * Return the division RUNNER UP winning pic for a year
   * @param divId Division ID
   * @param year 4 digit year
   */
  getRunnerUpPic(divId, year) {
    const champ = this.allChamps.find(x => +x.divisionId === +divId && +x.tournamentYear === +year && x.type === 'runner-up');
    return champ ? champ.pic : null;
  }

  /**
   * Initialize the division available to play.
   * User can select these for sending with their registration
   * chosen boolean starts false and true if selected by user
   */
  getDivisions() {
    this.subscriptions.push(this.regService.getDivisions(this.tournament.id).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
        this.divSelected = this.divisions.find(x => +x.id === +this.divisionId);
      } else {
        alert('Sorry, there was an error getting the division list');
        console.error(response);
      }
      this.getChampions();
    }));
  }

  getChampions() {
    this.subscriptions.push(this.tournamentService.getAllChampionsAllYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.allChamps = response.payload;
      } else {
        console.error(response);
      }
      this.getAllSponsors();
    }));
  }

  getAllSponsors() {
    this.subscriptions.push(this.tournamentService.getAllSponsors().subscribe(response => {
      if (response.status === 200) {
        this.allSponsors = response.payload;
      } else {
        console.error(response);
      }
      this.getSponsor();
    }));
  }

  /**
   * Get the sponsor associated to this division
   */
  getSponsor() {
    if (this.divSelected && this.divSelected.sponsorId) {
      this.subscriptions.push(this.tournamentService.getDivisionSponsor(this.divSelected.sponsorId).subscribe(response => {
        if (response.status === 200) {
          this.sponsor = response.payload;
        } else {
          console.error(response);
        }
        this.loading = false;
      }));
    } else {
      this.loading = false;
    }
  }

  getSponsorName() {
    return this.sponsor.name;
  }

  /**
   * Get the sponsor Ad URL link depending on Ad setting. 0 means default ad, 1 current ad
   * @param adSetting Ad setting flag
   */
  getSponsorAdLink(adSetting) {
    if (adSetting === '0') {
      return this.sponsor.website;
    } else {
      return this.sponsor.currentAdWebsite;
    }
  }

  /**
   * Get the sponsor Ad (image URL) depending on Ad setting. 0 means default ad, 1 current ad
   * @param adSetting Ad setting flag
   */
  getSponsorAd(adSetting) {
    if (adSetting === '0') {
      return this.sponsor.defaultAd;
    } else {
      return this.sponsor.currentAd;
    }
  }

  formatDate(dateTime: string) {
    const bits = dateTime.split(' ');
    return bits[0];
  }

  getSponsorLink(sponsorId) {
    return this.allSponsors.find(x => +x.id === +sponsorId).website;
  }

  getSponsorLogo(sponsorId) {
    return this.allSponsors.find(x => +x.id === +sponsorId).logo;
  }

  getCourseLogo(courseId) {
    return null;
  }

  goToReg() {
    this.router.navigate(['register']);
  }

  goToCompetitors(id) {
    this.router.navigate(['competitors/' + id]);
  }

  goToRules() {
    this.router.navigate(['home#rules']);
  }

}


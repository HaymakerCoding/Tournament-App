import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Division } from '../models/Division';
import { Router, ActivatedRoute } from '@angular/router';
import { TournamentChamp } from '../models/TournamentChamp';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Season } from '../models/Season';
import { DivisionSponsor } from '../models/DivisionSponsor';

@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.scss']
})
export class DivisionComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  loading: boolean;
  tournament: Tournament;
  divSelected: Division;
  years: number[];
  allChamps: TournamentChamp[];
  divisionId: number;
  onPhone: boolean;
  season: Season;

  constructor(
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
        this.getDivision();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get the division selected by the router param
   */
  getDivision() {
    this.subscriptions.push(this.tournamentService.getDivision(this.divisionId.toString()).subscribe(response => {
      if (response.status === 200) {
        this.divSelected = response.payload;
        this.getChampions();
      } else {
        alert('Sorry, there was an error getting the division list');
        console.error(response);
      }
    }));
  }

  getChampions() {
    this.subscriptions.push(this.tournamentService.getAllChampionsAllYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.allChamps = response.payload;
        this.loading = false;
      } else {
        console.error(response);
      }
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
   * Get the sponsor Ad (image URL) depending on Ad setting. 0 means default ad, 1 current ad
   * @param adSetting Ad setting flag
   */
  getSponsorAd(division: Division) {
    if (division.adSetting === '0') {
      return division.sponsor.defaultAd;
    } else {
      return division.sponsor.currentAd;
    }
  }

  getSponsorAdLink(division: Division) {
    if (division.adSetting === '0') {
      return division.sponsor.website;
    } else {
      return division.sponsor.currentAdWebsite;
    }
  }

  formatDate(dateTime: string) {
    const bits = dateTime.split(' ');
    return bits[0];
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


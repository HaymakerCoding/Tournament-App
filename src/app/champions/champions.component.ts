import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { TournamentService } from '../services/tournament.service';
import { Subscription } from 'rxjs';
import { Division } from '../models/Division';
import { TournamentChamp } from '../models/TournamentChamp';
import { Tournament } from '../models/Tournament';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Season } from '../models/Season';

/**
 * Champions page. Shows all champions assigned to divisions in a tournament season.
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-champions',
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.scss']
})
export class ChampionsComponent implements OnInit, OnDestroy {

  @Input() tournament: Tournament;
  subscriptions: Subscription[] = [];
  seasons: Season[];
  seasonSelected: Season;
  loading: boolean;
  divisions: Division[];
  champions: TournamentChamp[];
  leftList: Division[] = [];
  centerList: Division[] = [];
  rightList: Division[] = [];

  constructor(
    private tournamentService: TournamentService,
    private router: Router,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getTournament();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name);
        this.getSeasons();
      }));
    } else {
      this.getSeasons();
    }
  }

  /**
   * Seperate divisions into 3 list. Just for specific view layout
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
  }

  /**
   * Get all seasons for the tournament
   */
  getSeasons() {
    this.subscriptions.push(this.tournamentService.getAllSeasons(this.tournament.eventTypeId.toString()).subscribe(response => {
      this.seasons = response.payload;
      let year = new Date().getFullYear();
      const month = new Date().getMonth();
      if (month <= 5) { // Show the previous year up until July, note Javascript month starts at 0 for Jan
        year = year - 1;
      }
      this.seasonSelected = this.seasons.find(season => +season.year === +year);
      this.getAllDivisions();
    }));
  }

  getAllDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.seasonSelected).subscribe(response => {
      this.divisions = response.payload;
      this.initDivisionLists();
      this.getChampions();
    }));
  }

  getChampions() {
    this.subscriptions.push(this.tournamentService.getAllChampions(this.tournament.id, this.seasonSelected.year).subscribe(response => {
      this.champions = response.payload;
      this.loading = false;
    }));
  }

  getChamp(divId) {
    const champs = this.champions.find(x => x.divisionId === divId);
    if (champs && champs.partnerId) {
      return champs.fullName + ' & ' + champs.partnerName;
    } else {
      return champs ? champs.fullName : 'N/A';
    }
  }

  getChampImg(divId) {
    const champ = this.champions.find(x => x.divisionId === divId);
    return champ ? champ.pic : null;
  }

  /**
   * User changed season, dump lists and start back at fetching divisions for the season
   */
  onSeasonChanged() {
    this.leftList = [];
    this.centerList = [];
    this.rightList = [];
    this.loading = true;
    this.getAllDivisions();

  }

  goToDivision(id) {
    this.router.navigate(['/division/' + id ]);
  }

}

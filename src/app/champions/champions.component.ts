import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { TournamentService } from '../services/tournament.service';
import { Subscription } from 'rxjs';
import { Division } from '../models/Division';
import { TournamentChamp } from '../models/TournamentChamp';
import { Tournament } from '../models/Tournament';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-champions',
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.scss']
})
export class ChampionsComponent implements OnInit, OnDestroy {

  @Input() tournament: Tournament;

  subscriptions: Subscription[] = [];
  years: number[];
  selectedYear: number;
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

  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name);
        this.getYears();
      }));
    } else {
      this.getYears();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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

  getYears() {
    this.subscriptions.push(this.tournamentService.getYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.years = response.payload;
        if (this.years[0]) {
          const date = new Date();
          const month = date.getMonth();
          if (month <= 5 && this.years[1]) { // Show the previous year up until July, note Javascript month starts at 0 for Jan
            this.selectedYear = this.years[1];
          } else {
            this.selectedYear = this.years[0];
          }
        }
      } else {
        console.error(response);
      }
      this.getAllDivisions();
    }));
  }

  getAllDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
        this.initDivisionLists();
      } else {
        console.error(response);
      }
      this.getChampions();
    }));
  }

  getChampions() {
    this.subscriptions.push(this.tournamentService.getAllChampions(this.tournament.id, this.selectedYear).subscribe(response => {
      if (response.status === 200) {
        this.champions = response.payload;
      } else {
        console.error(response);
      }
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

  yearChanged(year) {
    this.selectedYear = year;
    this.loading = true;
    this.getChampions();

  }

  goToDivision(id) {
    this.router.navigate(['/division/' + id ]);
  }

}

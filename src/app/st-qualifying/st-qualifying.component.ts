import { Component, OnInit } from '@angular/core';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { CommishService } from '../services/commish.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TournamentYearlyData } from '../models/TournamentYearlyData';
import { Team } from '../models/Team';
import { UserReg } from '../commish-st-reg/commish-st-reg.component';

@Component({
  selector: 'app-st-qualifying',
  templateUrl: './st-qualifying.component.html',
  styleUrls: ['./st-qualifying.component.scss']
})
export class StQualifyingComponent extends TournamentBase implements OnInit {

  tournamentYearlyData: TournamentYearlyData;
  teams: Team[];
  divisions = ['O', 'A', 'B', 'C', 'D'];
  teamSelected: Team;
  registrations: UserReg[] = [];
  ranks: SlammerRanks;

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private commishService: CommishService,
    private snackbar: MatSnackBar
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
    this.titleService.setTitle(this.tournament.name);
    this.getYearlyData();
  }

  /**
   * Get the year specific data for the tournament
   */
  getYearlyData() {
    this.tournamentYearlyData = this.tournamentService.getYearlyData();
    if (!this.tournamentYearlyData) {
      this.subscriptions.push(this.tournamentService.setYearlyData().subscribe(response => {
        if (response.status === 200){
          this.tournamentYearlyData = response.payload;
          this.setLoadingPercent(40);
          this.getSTteams();
        } else {
          console.error(response);
        }
      }));
    } else {
      this.setLoadingPercent(40);
      this.getSTteams();
    }
  }

  /**
   * Get the ST Teams 
   */
  getSTteams() {
    this.subscriptions.push(this.commishService.getSTteams(this.tournamentYearlyData.year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.teams = response.payload;
        this.setLoadingPercent(60);
        this.getRanks();
      } else {
        console.error(response);
      }
    }));
  }

  getRanks() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDay();
    const min = date.getMinutes();
    const hours = date.getHours();
    const mysqlDate = year + '-' + month + '-' + day + ' ' + hours + ':' + min + ':00';    
    this.subscriptions.push(this.commishService.getRanks(mysqlDate, '1').subscribe(response => {
      if (response.status === 200) {
        this.ranks = response.payload;
        console.log(this.ranks);
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    })); 
  }

  /**
   * Event triggered when user changes teams
   */
  onTeamChanged() {
    if (this.teamSelected) {
      this.getTeamRegistrations();
    }
  }

  /**
   * Called every time the user changes team selection.
   * Get all registrations for that team
   */
  getTeamRegistrations() {
    this.setLoadingPercent(20);
    this.subscriptions.push(this.commishService.getSTRegistrations(this.tournamentYearlyData.id.toString(), this.teamSelected.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.registrations = response.payload;
        console.log(this.registrations);
        this.setRanks();
      } else {
        console.error(response);
      }
    }));
  }

  setRanks() {
    const noRanks: UserReg[] = []
    this.registrations.forEach(reg => {
      reg.rank = this.getPlayerRank(reg);
      if (!reg.rank || reg.rank === 0) {
        reg.rank = 9999;
      }
    });
    this.registrations.sort((a, b) => 
      a.rank - b.rank
    );
    this.setLoadingPercent(100);
  }

  getTeamDivRegistrations(team: Team, div: string) {
    const divRegistrations = this.registrations.filter(x => x.division === div);
    let needed = 10 - divRegistrations.length;
    const allReg: UserReg[] = [];
    const matches = this.registrations.filter(x => +x.team.id === +team.id && x.division === div);
    matches.forEach(x => {
      allReg.push(x);
    })
    for (let x = 1; x <= needed; x++) {
      const emptyReg = new UserReg(null, team, null, this.tournamentYearlyData.id, null, null, null, null, null, null, null);
      allReg.push(emptyReg);
    }
    return allReg;
  }

  getPlayerRank(reg: UserReg) {
    let rank: Rank;
    switch (reg.division) {
      case 'A' : {
        rank = this.ranks.A.find( x => +x.id === +reg.slammerId);
        break;
      }
      case 'B': {
        rank = this.ranks.B.find( x => +x.id === +reg.slammerId);
        break;
      }
      case 'C': {
        rank = this.ranks.C.find( x => +x.id === +reg.slammerId);
        break;
      }
      case 'D': {
        rank = this.ranks.D.find( x => +x.id === +reg.slammerId);
        break;
      }
      case 'O': {
        rank = this.ranks.O.find( x => +x.id === +reg.slammerId);
        break;
      }
      default : {
        console.error('Error in player rank, no matching div');
        rank = null;
      }
    }
    return rank ? rank.rank : 0;
  }
  

}

interface SlammerRanks {
  A: Rank[];
  B: Rank[];
  C: Rank[];
  D: Rank[];
  O: Rank[];
}

interface Rank {
  id: number;
  div: string,
  rank: number
}


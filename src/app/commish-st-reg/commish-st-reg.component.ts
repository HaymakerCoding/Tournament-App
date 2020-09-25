import { Component, OnInit } from '@angular/core';
import { CommishService } from '../services/commish.service';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { Team } from '../models/Team';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TournamentYearlyData } from '../models/TournamentYearlyData';

/**
 * Commish Cup Tournament registration for ST qualifying.
 * Members choose an ST Team and Division to register for.
 * Top 2 in each div can move on.
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-commish-st-reg',
  templateUrl: './commish-st-reg.component.html',
  styleUrls: ['./commish-st-reg.component.scss']
})
export class CommishStRegComponent extends TournamentBase {

  teams: Team[];
  divisions = ['O', 'A', 'B', 'C', 'D'];
  userReg: UserReg;
  tournamentYearlyData: TournamentYearlyData;
  userRegistered: boolean;

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
   * Get the ST Teams to offer as qualifying options, 5 teams each year
   */
  getSTteams() {
    this.subscriptions.push(this.commishService.getSTteams(this.tournamentYearlyData.year.toString(), this.tournamentYearlyData.id).subscribe(response => {
      if (response.status === 200) {
        this.teams = response.payload;
        this.setLoadingPercent(60);
        this.getUserRegistration();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get a user's registration for qualifying. If not registered initialize an empty reg obj
   */
  getUserRegistration() {
    this.subscriptions.push(this.commishService.getUserQualifyingReg(this.tournamentYearlyData.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.userReg = response.payload;
        console.log(this.userReg);
        if (!this.userReg.id) {
          // initialize empty reg, this is just so we can use the object in creating the reg
          const team = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
          this.userReg = new UserReg(null, team, null, this.tournamentYearlyData.id, null, null, null, null, null, null, null);
          this.userRegistered = false;
        } else {
          this.userRegistered = true;
          const team = this.teams.find(x => x.id === response.payload.team.id);
          this.userReg.team = team;
          console.log(this.userReg);
        }
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
    
  }

  /**
   * On user register for qualifying
   */
  register() {
    if (!this.userReg) {
      this.snackbar.open('Sorry you are missing registration info.', 'dismiss');
    } else if (!this.userReg.team) {
      this.snackbar.open('Please choose a team.', 'dismiss');
    } else if (!this.userReg.division) {
      this.snackbar.open('Please choose a division.', 'dismiss');
    } else {
      this.subscriptions.push(this.commishService.registerQualifier(this.userReg).subscribe(response => {
        if (response.status === 201) {
          this.snackbar.open('Thank you for registering!', '', { duration: 1100 });
          this.userRegistered = true;
          this.userReg.id = +response.payload;
        } else if (response.status === 599) {
          this.snackbar.open('Sorry, looks like you are already registered for this year\'s qualifying. If this is in error please contact ClubEG.', 'dismiss');
        } else {
          console.error(response);
          this.snackbar.open('Sorry, something went wrong with your registration. Please try back later or contact ClubEG.', 'dismiss');
        }
      }));
    }
  }

  /**
   * Update a user's qualifying reg
   */
  update() {
    this.subscriptions.push(this.commishService.updateQulifyingReg(this.userReg).subscribe(response => {
      if (response.status === 200) {
        this.snackbar.open('Your registration was updated!', '', { duration: 1100 });
      } else {
        console.error(response);
      }
    }));
  }

  delete() {
    if (confirm('Are you sure you want to be removed from qualifying?') === true) {
      this.subscriptions.push(this.commishService.deleteQulifyingReg(this.userReg.id.toString()).subscribe(response => {
        if (response.status === 200) {
          this.userRegistered = false;
          this.userReg = null;
          const team = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
          this.userReg = new UserReg(null, team, null, this.tournamentYearlyData.id, null, null, null, null, null, null, null);
        } else {
          console.error(response);
        }
      }));
    }
  }

}

/**
 * A user's Qualifying registration
 */
export class UserReg {

  constructor(
    public id: number,
    public team: Team,
    public division: string,
    public yearId: number,
    public date: any,
    public time: any,
    public fullName: string,
    public memberId: number,
    public slammerId: number,
    public rank: number,
    public finalRank: number
  ) {}
}

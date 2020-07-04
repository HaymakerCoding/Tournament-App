import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Tournament } from '../models/Tournament';
import { CommishService } from '../services/commish.service';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Team } from '../models/Team';
import { TournamentYearlyData } from '../models/TournamentYearlyData';

/**
 * Specific competitor page for Commish Cup. There will be some generic team usage but also Commish has a very specific 5 team roster of Slammers that gets populated by a qualifying.
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-commish-competitors',
  templateUrl: './commish-competitors.component.html',
  styleUrls: ['./commish-competitors.component.scss']
})
export class CommishCompetitorsComponent implements OnInit, OnDestroy {

  @Input() tournament: Tournament;
  subscriptions: Subscription[] = [];
  years: number[];
  yearSelected: number;
  loadingPercent: number;
  STteams: Team[];
  guestTeams: Team[];
  teamShown: number;
  yearlyData: TournamentYearlyData;

  constructor(
    private commishService: CommishService,
    private tournamentService: TournamentService
  ) { }

  ngOnInit(): void {
    this.setTeamShown(1);
    this.getYears();
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setTeamShown(num: number) {
    this.teamShown = num;
  }

  setLoadingPercent(percent) {
    this.loadingPercent = percent;
  }

  /**
   * Get a list of all years the tournament has data for. Just 4 digit years in array
   */
  getYears() {
    this.subscriptions.push(this.tournamentService.getYears(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.years = response.payload;
        this.yearSelected = this.years[0];
        this.setLoadingPercent(20);
        this.getYearlyData();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get the specific year record for the tournament selected
   */
  getYearlyData() {
    this.subscriptions.push(this.tournamentService.getYearlyDataAny(this.yearSelected.toString()).subscribe(response => {
      if (response.status === 200) {
        this.yearlyData = response.payload;
        this.setLoadingPercent(30);
        this.getSTteams();
      } else {
        console.error(response);
      }
    }))
  }

  /**
   * Get the ST Teams. These are specific to commish and don't change each year. 5 standard teams.
   */
  getSTteams() {
    this.subscriptions.push(this.commishService.getSTteams(this.yearSelected.toString(), this.yearlyData.id).subscribe(response => {
      if (response.status === 200) {
        this.STteams = response.payload;
        this.setLoadingPercent(40);
        this.getGuestTeams();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Get the Guest teams for this year. Guest Teams can change year to year with a max of 5. Players to these teams are added by admin or captains.
   */
  getGuestTeams() {
    this.subscriptions.push(this.tournamentService.getAllTeams(this.yearlyData.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.guestTeams = response.payload;
        //sort both guest and house team members by their clubeg avg
        this.sortByAvg(this.STteams);
        this.sortByAvg(this.guestTeams);
        this.setLoadingPercent(100);
      } else {
        console.error(response);
      }
    }));
    
  }

  /**
   * On user changing year selected. Adjust yearly data and fetch teams for that year.
   */
  onYearChange() {
    this.setLoadingPercent(20);
    this.getYearlyData();
  }

  sortByAvg(teams: Team[]) {
    teams.forEach(team => {
      team.members.sort((a, b) => (
        a.clubegScoringAvg - b.clubegScoringAvg
      ));
    });
  }

  /**
   * Return the clubeg scoring avg for the whole team.
   * @param team Team to sort
   */
  getTeamAvg(team: Team) {
    let total: number = 0;
    team.members.forEach(x => {
      total += x.clubegScoringAvg;
    });
    return Math.round(total / team.members.length);
  }

}

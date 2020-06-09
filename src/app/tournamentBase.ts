import { TournamentService } from "./services/tournament.service";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { Tournament } from "./models/Tournament";
import { OnDestroy, OnInit } from "@angular/core";

/**
 * Base class for most tournament pages.
 * We need to pull the tournament data at each page as a first step so most pages should extend this for reusing these common actions.
 * 
 * @author Malcolm Roy
 */
export abstract class TournamentBase implements OnInit, OnDestroy {

  tournament: Tournament;
  subscriptions: Subscription[] = [];
  loadingPercent: number;

  constructor(
      protected tournamentService: TournamentService,
      protected titleService: Title
  ) { }

  ngOnInit() {
    this.loadingPercent = 0;
    this.getTournament();
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  setLoadingPercent(percent: number) {
    this.loadingPercent = percent;
  }

  /**
   * Basic data pull of tournament based on host url. Gives us the tournament we are dealing with.
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.tournament.id = +this.tournament.id;
        this.setLoadingPercent(10);
        this.next();
      }));
    } else {
      this.setLoadingPercent(10);
      this.next();
    }
  }

  setTitle(title: string) {
    this.titleService.setTitle(this.tournament.name + ' ' + title);
  }

  /**
   * Next step to implement after the tournament data is loaded. Let extending class dicate next steps needed.
   */
  abstract next(): void;

}
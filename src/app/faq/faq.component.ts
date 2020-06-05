import { Component, OnInit } from '@angular/core';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Faq } from '../models/Faq';
import { TournamentFaq } from '../models/TournamentFaq';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  tournament: Tournament;
  subscriptions: Subscription[] = [];
  loading: boolean;
  faqs: Faq[];
  tournamentFaqs: TournamentFaq[];

  constructor(
    private tournamentService: TournamentService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getTournament();
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
        this.titleService.setTitle(this.tournament.name + ' FAQ');
        this.getFaqs();
      }));
    } else {
      this.getFaqs();
    }
  }

  /**
   * Get Global FAQ records
   */
  getFaqs() {
    this.subscriptions.push(this.tournamentService.getAllFaqs().subscribe(response => {
      if (response.status === 200) {
        this.faqs = response.payload;
      } else {
        console.error(response);
      }
      this.getTournamentFaqs();
    }));
  }

  /**
   * Get FAQ records specific to the tournament
   */
  getTournamentFaqs() {
    this.subscriptions.push(this.tournamentService.getAllFaqsByTournament(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.tournamentFaqs = response.payload;
      } else {
        console.error(response);
      }
      this.loading = false;
    }));
  }

}

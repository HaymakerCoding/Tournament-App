import { Component, OnInit } from '@angular/core';
import { TournamentNewsItem } from '../models/TournamentNewsItem';
import { Subscription } from 'rxjs';
import { TournamentNewsService } from '../services/tournament-news.service';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  newsItems: TournamentNewsItem[];
  tournament: Tournament;
  subscriptions: Subscription[] = [];
  loading: boolean;

  constructor(
    private newsService: TournamentNewsService,
    private tournamentService: TournamentService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getTournament();
  }

  /**
   * First Step - Get ALL data for this tournament page. Fetch by host
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name);
        this.getNewsItems();
        console.log(this.tournament);
      }));
    } else {
      this.getNewsItems();
    }
  }

  getNewsItems() {
    this.subscriptions.push(this.newsService.getAll(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.newsItems = response.payload;
      } else {
        console.error();
      }
      this.loading = false;
    }));
  }

}

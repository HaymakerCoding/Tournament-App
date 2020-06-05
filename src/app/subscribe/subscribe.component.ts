import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from '../models/Tournament';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit, OnDestroy {

  form: FormGroup;
  subscriptions: Subscription[] = [];
  tournament: Tournament;
  loading: boolean;
  thankYouText: string;
  hasError: boolean;

  constructor(
    private tournamentService: TournamentService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.hasError = false;
    this.loading = true;
    this.getTournament();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50)])),
      email: new FormControl('', Validators.compose([Validators.required, Validators.email, Validators.maxLength(100)])),
      tournamentName: new FormControl(this.tournament.name)
    });
    this.loading = false;
  }

  /**
   * First Step - Get ALL data for this tournament page. Fetch by host
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name + ' Email Subscription');
        this.initForm();
      }));
    } else {
      this.initForm();
    }
  }

  submitForm(form) {
    if (this.form.get('name').value === '' || this.form.get('email').value === '' || !this.form.valid) {
      this.hasError = true;
    } else {
      let to = this.tournament.host;
      to = to.replace('dev.', '');
      to = to.replace('www.', '');
      this.subscriptions.push(this.tournamentService.sendSubscribeEmail(form, to).subscribe(response => {
        if (response.status === 200) {
          this.thankYouText = 'Thank you for your interest. Your email will be added to our lists.';
        } else {
          alert('Sorry there was an error sending your request');
          console.error(response);
        }
      }));
    }
  }


}

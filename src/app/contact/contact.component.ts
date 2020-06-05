import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {

  @Input() tournament: Tournament;
  form: FormGroup;
  subscriptions: Subscription[] = [];
  formSent: boolean;
  loading: boolean;
  sending: boolean;

  constructor(
    private tournamentService: TournamentService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.sending = false;
    this.formSent = false;
    this.loading = true;
    this.getTournament();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Format the email link using the host
   */
  getEmail(prefix): string {
    let email = this.tournament.host.replace('dev.', '');
    email = email.replace('www.', '');
    return prefix ? prefix + email : email;
  }

  /**
   * Get the current tournamennt
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name);
        this.initForm();
      }));
    } else {
      this.initForm();
    }
  }

  initForm() {
    let to = this.tournament.host.replace('dev.', '');
    to = to.replace('www.', '');
    this.form = new FormGroup({
      subject: new FormControl('Question/Comment for ' + this.tournament.name),
      to: new FormControl(to),
      name: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50)])),
      email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      comments: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(300)])),
    });
    this.loading = false;
  }

  sendForm(form) {
    if (!form.name) {
      alert('Please supply a name we can use when contacting you.');
    } else if (!form.email) {
      alert('Please supply an email we can use when contacting you.');
    } else if (!form.comments) {
      alert('Please provide a question or comment.');
    } else if (!this.form.valid) {
      alert('Sorry you have error in your form. Please correct and try again.');
    } else if (this.sending === false) {
      this.sending = true;
      this.subscriptions.push(this.tournamentService.sendContactEmail(form).subscribe(response => {
        if (response.status === 200) {
          this.formSent = true;
          this.form.reset();
        } else {
          alert('Sorry something went wrong sending your request. Please try back later.');
          console.error(response);
        }
        this.sending = false;
      }));
    }
  }

  getMessengerLink() {
    // remove any preceding sub domains or www then return the messenger url
    let messenger = this.tournament.host.replace('dev.', '');
    messenger = messenger.replace('www.', '');
    return 'http://m.me/' + messenger;
  }

}

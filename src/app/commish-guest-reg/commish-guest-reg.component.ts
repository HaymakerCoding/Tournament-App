import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TournamentBase } from '../tournamentBase';
import { Title } from '@angular/platform-browser';
import { TournamentService } from '../services/tournament.service';
import { CommishService } from '../services/commish.service';

@Component({
  selector: 'app-commish-guest-reg',
  templateUrl: './commish-guest-reg.component.html',
  styleUrls: ['./commish-guest-reg.component.scss']
})
export class CommishGuestRegComponent extends TournamentBase implements OnInit {

  form: FormGroup;
  formSent: boolean;

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private commishService: CommishService
  ) {
    super(tournamentService, titleService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.formSent = false;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  next() {
    this.initForm();
    this.setLoadingPercent(100);
  }

  initForm() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100)])),
      teamName: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100)])),
      email: new FormControl('', Validators.compose([Validators.required, Validators.email]))
    })
  }

  /**
   * on user click submit, send the form to server processing
   * @param form Form
   */
  submitForm(form: FormGroup) {
    const to = this.tournament.host;
    this.subscriptions.push(this.commishService.sendGuestTeamEmail(form, to).subscribe(response => {
      console.log(response);
      if (response.status === 200) {
        this.formSent = true;
      } else {
        console.error(response);
      }
    }));
  }

}

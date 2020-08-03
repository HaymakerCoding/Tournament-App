import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { RegistrationService } from '../services/registration.service';
import { Tournament } from '../models/Tournament';
import { TournamentService } from '../services/tournament.service';
import { RegistrationBasic } from '../models/RegistrationBasic';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginComponent } from '../login/login.component';
import { Registration } from '../models/Registration';
import { TournamentYearlyData } from '../models/TournamentYearlyData';
import { Division } from '../models/Division';
import { Router } from '@angular/router';
import { MemberService } from '../services/member.service';
import { BasicMember } from '../models/BasicMember';
import { Title } from '@angular/platform-browser';
import { Season } from '../models/Season';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  tournament: Tournament;
  loading: boolean;
  loadingMembers: boolean;
  userLoggedIn: boolean;
  userRegistered: boolean;
  userBailed: boolean;
  userRegistrations: Registration[];
  form: FormGroup;
  divisions: Division[];
  dialogRef: MatDialogRef<any>;
  yearlyData: TournamentYearlyData;
  justRegistered: boolean;
  userName: string;
  userId: number;
  members: BasicMember[];
  masterMemberList: BasicMember[];
  matchingMembers: BasicMember[];
  leftList: Division[] = [];
  centerList: Division[] = [];
  rightList: Division[] = [];
  unsavedChanges: boolean;
  searchOpen: boolean;

  memberSearchBtn: HTMLButtonElement;

  @HostListener('window:keydown', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    if (this.searchOpen === true && event.keyCode === 13) {
      event.preventDefault();
      this.memberSearchBtn.click();
    }
  }

  constructor(
    private memberService: MemberService,
    private regService: RegistrationService,
    private tournamentService: TournamentService,
    protected authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private snackbar: MatSnackBar,
    private titleService: Title,
    private season: Season
  ) { }

  ngOnInit() {
    this.searchOpen = false;
    this.loadingMembers = false;
    this.unsavedChanges = false;
    this.justRegistered = false;
    this.initForm();
    this.userRegistered = false;
    this.loading = true;
    this.getTournament();
  }

  getSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.getYearlyData();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * First Step - Get ALL data for this tournament page. Fetch by host
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.titleService.setTitle(this.tournament.name + ' Registration');
        this.getSeason();
      }));
    } else {
      this.getSeason();
    }
  }

  /**
   * Get the data that can differ by year.
   * NOTE for here we won't bother getting the sponsors/courses
   */
  getYearlyData() {
    this.yearlyData = this.tournamentService.getYearlyData();
    if (!this.yearlyData) {
      this.subscriptions.push(this.tournamentService.setYearlyData().subscribe(response => {
        this.yearlyData = response.payload;
        this.getDivisions();
      }));
    } else {
      this.getDivisions();
    }
  }

  /**
   * Initialize the division available to play.
   * User can select these for sending with their registration
   * chosen boolean starts false and true if selected by user
   */
  getDivisions() {
    this.subscriptions.push(this.tournamentService.getAllDivisions(this.season).subscribe(response => {
      if (response.status === 200) {
        this.divisions = response.payload;
        this.initDivisionLists();
      } else {
        alert('Sorry, there was an error getting the division list');
        console.error(response);
      }
      this.checkLoggedIn();
    }));
  }

  addBtn(btn: MatButton) {
    this.memberSearchBtn = btn._elementRef.nativeElement;
  }

  /**
   * Break the divisions into 3 columns for display purposes
   */
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.compose([Validators.email, Validators.required]))
    });
  }

  setUserName() {
    this.userName = this.authService.getUserName();
  }
  setUserId() {
    this.userId = this.authService.getUserId();
  }

  /**
   * Change member's registration status to 'bailed'
   * @param id Reg Id
   */
  bail(id) {
    this.subscriptions.push(this.regService.updateStatus(id, 'bailed').subscribe(response => {
      if (response.status === 200) {
        this.userRegistrations.find(x => x.id === id).status = 'bailed';
      } else {
        console.error(response);
        alert('Sorry there was a problem removing you from the tournament.');
      }
    }));
  }

  /**
   * Check the user is logged in which is required for registering in the tournament.
   * If not we show the login dialog.
   * If so we set their name and id variables needed and check for their division registrations
   */
  checkLoggedIn() {
    console.log('checking login');
    if (this.authService.getIsLoggedIn() === true && this.authService.getUserName()) {
      this.userLoggedIn = true;
      this.setUserName();
      this.setUserId();
      this.checkUserRegistered();
      this.authService.isLoggedIn = true;
    } else {
      this.subscriptions.push(this.authService.checkLoggedIn().subscribe(response => {
        if (response.status === 200) {
          this.userLoggedIn = true;
          this.setUserName();
          this.setUserId();
          this.checkUserRegistered();
          this.authService.isLoggedIn = true;
        } else {
          this.userLoggedIn = false;
          this.showLogin();
          this.loading = false;
        }
      }));
    }
  }

  /**
   * Determine if a user is registered AND return all their division registrations as an array of Registrations objs
   * If we have some registrations then we set them as 'registered' for this years tournament
   */
  checkUserRegistered() {
    if (this.userLoggedIn === true) {
      this.subscriptions.push(this.regService.isUserRegistered(this.tournament.id.toString(),
        this.yearlyData.year.toString()).subscribe(response => {
        if (response.status === 200) {
          if (response.payload ) {
            const registrations: Registration[] = response.payload;
            this.userRegistrations = registrations;
          }
          if (this.userRegistrations && this.userRegistrations.length > 0 ) {
            this.userRegistered = true;
          } else {
            this.userRegistered = false;
          }
        } else {
          console.error(response);
        }
        this.loading = false;
      }));
    } else {
      this.loading = false;
    }
  }

  /**
   * Check the user's updates to their divisions. When updates are made we need to remove their partner's division choice for
   * as well for the division the user bailed from
   * @param oldDivisionList Old list of divisions before changes
   * @param newDivisionList New list user saved
   */
  updatePartnerDivisionChanges(oldDivisionList: Division[], newDivisionList: Division[]) {
    const updateList: Division[] = [];
    // find partner division changes that need to have the partner unregisterd for
    oldDivisionList.forEach(old => {
      if (newDivisionList.some( x => x.id === old.id) === false && old.partnerEntered) {
        updateList.push(old);
      }
    });
    updateList.forEach(x => {
      console.log(x);
    });
  }

  getPartner(reg: Registration)  {
    return reg.partnerFullName;
  }

  /**
   * Adjust the players selected divisions. This sets the in memory selection and highlights the ui check boxes. Changes still need to be saved by user.
   * @param checkBox Check box element represting state of division reg
   * @param division Division to adjust reg for
   */
  adjustDivisions(checkBox: MatCheckbox, division: Division) {
    if (checkBox.checked) {
      // client side check of today being a valid registrations day for this divivision. Each div has an open and close date/time
      const regOpen = this.getJavaDateFromMySQL(division.regOpen);
      const regClosed = this.getJavaDateFromMySQL(division.regClosed);
      const now = new Date();
      if (now >= regOpen && now < regClosed) {
        this.addNewTempReg(division.id, null, null);
      } else {
        const msg = now < regOpen ? 'Sorry registrations are not open yet.' : 'Sorry registrations are closed.';
        this.snackbar.open(msg, 'dismiss');
      }
    } else {
      this.removeRegByDivisionId(division.id);
    }
    this.unsavedChanges = true;
  }

  goToEditProfile() {
    window.location.href = 'https://clubeg.golf/clubeg-app/#/profile/edit';
  }

  /**
   * Return a Date Obj from a mysql string date time.
   * @param mysqlDateTime Date time
   */
  getJavaDateFromMySQL(mysqlDateTime: string) {
    let bits: any = mysqlDateTime.split(/[- :]/);
    bits[1]--;
    const dateOjb = new Date(bits[0], bits[1], bits[2], bits[3], bits[4], bits[5]);
    return dateOjb;
  }

  goToCompetitors() {
    this.router.navigate(['/competitors']);
  }

  /**
   * Insert new Registrations for divisions selected
   * This is used for initial REG and UPDATE reg. All current division registions will be flushed then newly selected added
   */
  saveMemberReg() {
    if (this.userRegistrations.length > 0 || this.userRegistered === true) {
      this.subscriptions.push(this.regService.add(this.tournament.id, this.yearlyData.year,
        this.userRegistrations).subscribe(response => {
        if (response.status === 201) {
          if (this.userRegistered === false) {
            this.userRegistered = true;
            this.justRegistered = true;
          } else if (this.userRegistered === true && this.userRegistrations.length < 1) {
            // user cleared all registrations so now unregistered
            this.userRegistered = false;
          }
          // Re Fetch the registrations
          this.checkUserRegistered();
          this.snackbar.open('Changes saved successfully!', 'dismiss', { duration: 1200 });
          this.unsavedChanges = false;
          this.sendRegEmail(this.userRegistrations);
        } else {
          alert('Sorry there was an error saving your registration. Please try back later.');
          console.error(response);
        }

      }));
    } else {
      alert('Please choose at least 1 division to compete in.');
    }
  }

  /**
   * Send an email to tournament administration notifying of new registrations or registration changes made
   */
  sendRegEmail(registrations: Registration[]) {
    const regDivisions = [];
    registrations.forEach(x => {
      const division = this.divisions.find(d => d.id === x.divisionId);
      const partner = x.partnerFullName;
      const div = { name : division.name, partner };
      regDivisions.push(div);
    });
    let to = this.tournament.host.replace('dev.', '');
    to = to.replace('www.', '');
    this.subscriptions.push(this.regService.sendNotifyRegEmail(to, this.tournament.name,
      regDivisions).subscribe(response => {
      if (response.status === 200) {

      } else {
        console.error(response);
      }
    }));
  }

  showLogin() {
    this.dialogRef = this.dialog.open(LoginComponent);
    this.dialogRef.afterClosed().subscribe(response => {
      if (response && response === 200) {
        this.checkLoggedIn();
      }
    });
  }

  /**
   * Open a dialog to allow the user to search for members to add as partners in their registration
   * @param dialog Dialog element to open
   * @param division Divion
   * @param partner ?
   */
  openMemberSearch(dialog, division: Division, partner) {
    this.searchOpen = true;
    this.dialogRef = this.dialog.open(dialog, { autoFocus: false, data: { members: [], div: division }});
    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        const userReg = this.userRegistrations.find(x => +x.divisionId === +division.id);
        userReg.partnerFullName = response.data.fullName;
        userReg.partnerId = response.data.memberId;
      }
      this.searchOpen = false;
    });
  }

  /**
   * Return the partner selected for the User by a division
   * Note A user can also be registerd by someone else as a selected PARTNER
   * We need to check this and return the main member if the user is the partner
   * @param division Division selected
   */
  getSelectedPartner(division: Division) {
    const reg = this.userRegistrations.find(x => +x.divisionId === +division.id);
    if (reg) {
      if (+reg.memberId === +this.userId || reg.memberId === null) {
        // user is the main registrant
        return reg.partnerFullName ? reg.partnerFullName : null;
      } else {
        // user is the partner selected
        return reg.fullName ? reg.fullName : null;
      }
    }
  }

  /**
   * Return a list of members matching the entered text. Partial matches work
   * @param text User entered text
   */
  filterMembers(text: string, divId) {
    if (text && text.length > 2) {
      this.getMatchingMembers(text);
    }
  }

  /**
   * A member is selected as a partner.
   * Add the member ID and name to the reg AFTER dialog is closed
   * @param member Member to add as partner
   */
  memberSelected(member) {
    this.dialogRef.close({ data: { memberId: member.memberId, fullName: member.fullName }});
  }

  /**
   * Get all members, basic list data
   */
  getMatchingMembers(text) {
    this.loadingMembers = true;
    this.subscriptions.push(this.memberService.getMatchingMembers(text).subscribe(response => {
      if (response.status === 200) {
        this.matchingMembers = response.payload;
      } else {
        console.error(response);
        alert('Sorry there was a problem getting the members from database');
      }
      this.loadingMembers = false;
    }));
  }

  /**
   * Return boolean of whether or not at least 1 division has been chosen by user
   */
  isDivisionSelected() {
    return this.userRegistrations.length > 0;
  }

  isDivisionChosen(id) {
    if (this.userRegistrations) {
      return this.userRegistrations.some(x => x.divisionId === id);
    } else {
      return null;
    }
  }

  close() {
    this.dialogRef.close();
  }

  removeRegByDivisionId(divId) {
    this.userRegistrations = this.userRegistrations.filter(x => x.divisionId !== divId);
  }

  /**
   * Add a new registration to the user's registrations. In memory data. Needs to be sent to the database when user saves changes.
   * @param divisionId Division PK
   * @param memberId Member PK
   * @param partnerId Partner selected Member PK
   */
  addNewTempReg(divisionId, memberId, partnerId) {
    this.userRegistrations.push(new Registration(null, this.tournament.id, divisionId, this.yearlyData.year,
      null, null, memberId, partnerId, null, null));
  }

}



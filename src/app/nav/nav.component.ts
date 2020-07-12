import { Component, OnInit, OnDestroy, HostListener, Output, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from '../models/Tournament';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NavService, ScrollState } from '../services/nav.service';

/**
 * Navigation for the app.
 * Track the route currently on and provide navigation to other routes.
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

  userLoggedIn: boolean;
  subscriptions: Subscription[] = [];
  private dialogRef: MatDialogRef<any>;
  userName: string;
  tournament: Tournament;
  loading: boolean;
  onPhone: boolean;
  pageYOffset;
  route: string;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private tournamentService: TournamentService,
    private breakpointOberver: BreakpointObserver,
    private navService: NavService,
    private router: Router
  ) {
    
    // subscribe to route changes. Use these to track which route we are on for different nav button operations
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route = router.url;
      } 
    });
    
  }

  // Listen for window scroll. used to set the nav as sticky.
  // IMPORTANT: noticed that  body/html NEEDS to be min-height NOT height in main style file. For some reason using height:100% instead of min-height:100% broke listener for scroll
  @HostListener('window:scroll', ['$event']) // for window scroll events
  onWindowScroll(event) {
    this.pageYOffset = window.pageYOffset;
  }

  scrollToNews() {
    this.navService.setState(ScrollState.NEWS);
  }
  scrollToCompetitor() {
    this.navService.setState(ScrollState.COMPETITOR);
  }
  scrollToPrizing() {
    this.navService.setState(ScrollState.PRIZING);
  }
  scrollToRules() {
    this.navService.setState(ScrollState.RULES);
  }
  scrollToContact() {
    this.navService.setState(ScrollState.CONTACT);
  }
  scrollToTop() {
    this.navService.setState(ScrollState.TOP);
  }

  ngOnInit() {
    this.initBreakObserver();
    this.loading = true;
    this.userLoggedIn = false;
    this.checkLoggedIn();
    this.getTournament();
  }

  /**
   * Listen to screen size changes, for setting phone specific settings like nav background image
   */
  initBreakObserver() {
    this.breakpointOberver.observe(
      ['(max-width: 800px)']).subscribe(result => {
        if (result.matches) {
          this.onPhone = true;
        } else {
          this.onPhone = false;
        }
      });
  }

  scrollToReg() {
    const reg = document.getElementById('regSection');
    reg.scrollIntoView({ behavior: 'smooth', block: 'start'});
  }

  /**
   * Apply the sticky nav CSS when scrolling past the header image at top
   * @param headerImg Header Image element
   */
  checkStickyNav(headerImg) {
    if (this.pageYOffset > headerImg.offsetTop && this.pageYOffset > 170)  {
      return true;
    } else  {
      return false;
    }
  }

  logout() {
    this.authService.isLoggedIn = false;
    localStorage.clear();
    this.userLoggedIn = false;
    this.userName = null;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleNav(btn) {
    btn.click();
  }

  /**
   * First Step - Get ALL data for this tournament page. Fetch by host
   */
  getTournament() {
    this.tournament = this.tournamentService.getTournament();
    if (!this.tournament) {
      this.subscriptions.push(this.tournamentService.setTournament().subscribe(response => {
        this.tournament = response.payload;
        this.loading = false;
      }));
    } else {
      this.loading = false;
    }
  }

  showLogin() {
    this.dialogRef = this.dialog.open(LoginComponent);
    this.dialogRef.afterClosed().subscribe(response => {
      if (response && response === 200) {
        this.userLoggedIn = true;
        this.checkLoggedIn();
      }
    });
  }

  checkLoggedIn() {
    if (this.authService.getIsLoggedIn() === true && this.authService.getUserName()) {
      this.userName = this.authService.getUserName();
      this.userLoggedIn = true;
    } else {
      this.subscriptions.push(this.authService.checkLoggedIn().subscribe(response => {
        if (response.status === 200) {
          this.userName = this.authService.getUserName();
          this.userLoggedIn = true;
        } else {
          this.userLoggedIn = false;
        }
      }));
    }
  }

}

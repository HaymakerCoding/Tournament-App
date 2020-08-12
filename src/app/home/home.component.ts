import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import smoothscroll from 'smoothscroll-polyfill';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from '../models/Tournament';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { TournamentYearlyData } from '../models/TournamentYearlyData';
import { Title } from '@angular/platform-browser';
import { TournamentNewsService } from '../services/tournament-news.service';
import { TournamentNewsItem } from '../models/TournamentNewsItem';
import { NavService } from '../services/nav.service';
import { Season } from '../models/Season';
import { DivisionSponsor } from '../models/DivisionSponsor';
import { TournamentCourse } from '../models/TournamentCourse';

/**
 * Entry point for the tournament app SPA.
 * This homepage includes many child componenet that can be scrolled to.
 * Scroll is done using third party smoothscroll, due to browser compatibility issues with HTML smooth scroll in Safari. The smoothscroll polyfill will only work if it detects default doesn't.
 * 
 * @author Malcolm Roy
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('news') newsElement: ElementRef;
  @ViewChild('champions') competitorElement: ElementRef;
  @ViewChild('prizing') prizingElement: ElementRef;
  @ViewChild('rules') rulesElement: ElementRef;
  @ViewChild('contact') contactElement: ElementRef;
  @ViewChild('top') topElement: ElementRef;

  private dialogRef: MatDialogRef<any>;
  userLoggedIn: boolean;
  private subscriptions: Subscription[] = [];
  tournament: Tournament;
  loading: boolean;
  year: number;
  sponsorList: LinkableImage[] = [];
  courseList: LinkableImage[] = [];
  onPhone: boolean;
  newsItems: TournamentNewsItem[];
  courseWidth: number;
  sponsorWidth: number;
  season: Season;
  sponsors: DivisionSponsor[];
  courses: TournamentCourse[];

  constructor(
    private tournamentService: TournamentService,
    private breakpointOberver: BreakpointObserver,
    private router: Router,
    private titleService: Title,
    private newsService: TournamentNewsService,
    private navService: NavService,
  ) { }

  ngOnInit() {
    this.initBreakObserver();
    // initialize year to current year - year is a required param to pull registrations for certain year of tournament
    this.year = new Date().getFullYear();
    this.loading = true;
    this.userLoggedIn = false;
    smoothscroll.polyfill();
    this.getTournament();
    this.initNavService();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
        this.getSeason();
      }));
    } else {
      this.getSeason();
    }
  }

  getSeason() {
    const year = new Date().getFullYear();
    this.subscriptions.push(this.tournamentService.getSeason(this.tournament.eventTypeId.toString(), year.toString()).subscribe(response => {
      if (response.status === 200) {
        this.season = response.payload;
        this.getSponsors();
      } else {
        console.error(response);
      }
    }));
  }

  getSponsors() {
    this.subscriptions.push(this.tournamentService.getSeasonSponsors(this.season.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.sponsors = response.payload;
        this.getCourses();
      } else {
        console.error(response);
      }
    }));
  }

  getCourses() {
    this.subscriptions.push(this.tournamentService.getSeasonCourses(this.season.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.courses = response.payload;
        this.initCourseAndSponsors();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Take all courses and sponsors and build them into lists for displaying in the moving 'ticker' of logos
   * We setup a buffer of images and then loop it with css
   */
  initCourseAndSponsors() {
    // seperate the courses and sponsors for the tournament into specifc lists
    this.courses.forEach(x => {
      const course = { id: x.courseId, name: x.fullName, link: null, pic: x.logo };
      this.courseList.push(course);
    });
    this.sponsors.forEach(x => {
      const sponsor = { id: x.id, name: x.name, link: x.website, pic: x.logo };
      this.sponsorList.push(sponsor);
    });
    // set image repeats to fill page IF there are more images than can fit on screen BASED on image width being 100
    const target = 100; // target a buffer of 100 images for both sponsors and courses
    this.courseWidth = 200;
    if (this.courseList.length * 200 >= window.innerWidth) {
      // too many courses to fit on screen
      this.courseWidth = 100;
    }
    if (this.courseWidth === 100) {
      let current = this.courseList.length;
      let index = 0;
      while (current < target) {
        if (index < this.courseList.length - 1) {
          this.courseList.push(this.courseList[index]);
          index++;
          current++;
        } else {
          index = 0;
        }
      }
    }
    if (this.sponsorList.length * 200 >= window.innerWidth) {
      // too many sponsors to fit on screen
      this.sponsorWidth = 100;
    }
    if (this.sponsorWidth === 100) {
      let current = this.sponsorList.length;
      let index = 0;
      while (current < target) {
        if (index < this.sponsorList.length - 1) {
          this.sponsorList.push(this.sponsorList[index]);
          index++;
          current++;
        } else {
          index = 0;
        }
      }
    }
    this.getNewsItems();
  }

  /**
   * Get all news items for this tournament. Then reduce to show only 3.
   */
  getNewsItems() {
    this.subscriptions.push(this.newsService.getAll(this.tournament.id.toString()).subscribe(response => {
      if (response.status === 200) {
        this.newsItems = response.payload;
        if (this.newsItems.length > 3) {
          // reduce results to only 3 news items if more than that available
          const newArray = [];
          newArray.push(this.newsItems[0]);
          newArray.push(this.newsItems[1]);
          newArray.push(this.newsItems[2]);
          this.newsItems = newArray;
        }
      } else {
        console.error();
      }
      this.loading = false;
    }));
  }

  /**
   * Navigate to the full news items page
   */
  goToNews() {
    this.router.navigate(['news']);
  }

  /**
   * Give the image some margins if there are less than required to trigger slide
   */
  getSponsorMargins() {
    if (this.onPhone === true) {
      return 0;
    } else {
      return this.sponsorWidth === 200 ? '50px' : 0;
    }
  }

  /**
   * Give the image some margins if there are less than required to trigger slide
   */
  getCourseMargins() {
    if (this.onPhone === true) {
      return 0;
    } else {
      return this.courseWidth === 200 ? '50px' : 0;
    }
  }

  /**
   * Determine whether we will 'SLIDE' the course images, by setting the first image to move.
   * Based on whether images are greater than can fit on screen
   * @param i first image
   */
  setFirst(i, type: string) {
    // set list to courses or sponsors based on string based in
    const list = type === 'courses' ? this.courseList : this.sponsorList;
    const logoWidth = type === 'courses' ? this.courseWidth : this.sponsorWidth;

    if (i === 0 && ((list.length * logoWidth) > window.innerWidth)) {
      return true;
    } else {
      return false;
    }

  }

  close() {
    this.dialogRef.close();
  }

  scrollTo(element) {
    // element.scrollIntoView(true);
    element.scrollIntoView({ behavior: 'smooth', block: 'start'});
  }

  /**
   * This nav bar service tracks user actions in nav for scrolling to in page elements
   */
  initNavService() {
    this.subscriptions.push(this.navService.getState().subscribe(response => {
      switch (response) {
        case 1 : this.scrollTo(this.newsElement.nativeElement); break;
        case 2 : this.scrollTo(this.competitorElement.nativeElement); break;
        case 3 : this.scrollTo(this.prizingElement.nativeElement); break;
        case 4 : this.scrollTo(this.rulesElement.nativeElement); break;
        case 5 : this.scrollTo(this.contactElement.nativeElement); break;
        case 6 : this.scrollTo(this.topElement.nativeElement); break;
        default: console.error('no scroll route found');
      }
    }));
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

}

interface LinkableImage {
  id: number;
  name: string;
  link: string;
  pic: string;
}



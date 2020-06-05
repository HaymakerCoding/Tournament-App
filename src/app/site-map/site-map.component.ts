import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Tournament } from '../models/Tournament';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-site-map',
  templateUrl: './site-map.component.html',
  styleUrls: ['./site-map.component.scss']
})
export class SiteMapComponent implements OnInit {

  @Input() tournament: Tournament;
  onPhone: boolean;

  constructor(
    private breakpointOberver: BreakpointObserver
  ) { }

  ngOnInit() {
    this.initBreakObserver();
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

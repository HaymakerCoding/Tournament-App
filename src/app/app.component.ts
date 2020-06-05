import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter} from 'rxjs/operators';

declare var gtag;
declare var getId;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'tournament-app';

  constructor(router: Router) {
    const navEndEvents = router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    );
    navEndEvents.subscribe((event: NavigationEnd) => {
      gtag('config', getId(), {
        page_path: event.urlAfterRedirects
      });
    });
  }

}

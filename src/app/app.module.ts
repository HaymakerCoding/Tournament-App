import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTabsModule} from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { LoginComponent } from './login/login.component';
import { SiteMapComponent } from './site-map/site-map.component';
import { RulesComponent } from './rules/rules.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ScoresComponent } from './scores/scores.component';
import { RegisterComponent } from './register/register.component';
import { AuthService } from './services/auth.service';
import { CompetitorsComponent } from './competitors/competitors.component';
import { DivisionsComponent } from './divisions/divisions.component';
import { ChampionsComponent } from './champions/champions.component';
import { ContactComponent } from './contact/contact.component';
import { DivisionComponent } from './division/division.component';
import { AllCompetitorsComponent } from './all-competitors/all-competitors.component';
import { NewsComponent } from './news/news.component';
import { ChampionsPageComponent } from './champions-page/champions-page.component';
import { PrizingPageComponent } from './prizing-page/prizing-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { RulesPageComponent } from './rules-page/rules-page.component';
import { PrizingComponent } from './prizing/prizing.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { FaqComponent } from './faq/faq.component';
import { LiveResultsComponent } from './live-results/live-results.component';
import { ResultsComponent } from './results/results.component';
import { CmpcLiveComponent } from './cmpc-live/cmpc-live.component';
import { CommishStTeamsComponent } from './commish-st-teams/commish-st-teams.component';
import { CommishGuestRegComponent } from './commish-guest-reg/commish-guest-reg.component';
import { CommishStRegComponent } from './commish-st-reg/commish-st-reg.component';
import { StQualifyingComponent } from './st-qualifying/st-qualifying.component';
import { CommishCompetitorsComponent } from './commish-competitors/commish-competitors.component';
import { DrawComponent } from './draw/draw.component';
import { HoleByHoleScoresComponent } from './hole-by-hole-scores/hole-by-hole-scores.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    LoginComponent,
    SiteMapComponent,
    RulesComponent,
    ScoresComponent,
    RegisterComponent,
    CompetitorsComponent,
    DivisionsComponent,
    ChampionsComponent,
    ContactComponent,
    DivisionComponent,
    AllCompetitorsComponent,
    NewsComponent,
    ChampionsPageComponent,
    PrizingPageComponent,
    ContactPageComponent,
    RulesPageComponent,
    PrizingComponent,
    SubscribeComponent,
    FaqComponent,
    LiveResultsComponent,
    ResultsComponent,
    CmpcLiveComponent,
    CommishStTeamsComponent,
    CommishGuestRegComponent,
    CommishStRegComponent,
    StQualifyingComponent,
    CommishCompetitorsComponent,
    DrawComponent,
    HoleByHoleScoresComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule, MatTabsModule, MatSnackBarModule, MatRadioModule, MatCheckboxModule, MatSidenavModule,
    MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, MatSliderModule, MatToolbarModule, MatMenuModule,
    MatCardModule, MatSlideToggleModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatExpansionModule,
    MatDatepickerModule, MatTooltipModule, MatProgressBarModule, MatButtonToggleModule
  ],
  providers: [
    AuthService
  ],
  entryComponents: [LoginComponent, HoleByHoleScoresComponent ],
  bootstrap: [AppComponent]
})
export class AppModule { }

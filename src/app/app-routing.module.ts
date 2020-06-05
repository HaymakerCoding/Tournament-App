import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RulesComponent } from './rules/rules.component';
import { ScoresComponent } from './scores/scores.component';
import { RegisterComponent } from './register/register.component';
import { CompetitorsComponent } from './competitors/competitors.component';
import { DivisionsComponent } from './divisions/divisions.component';
import { DivisionComponent } from './division/division.component';
import { AllCompetitorsComponent } from './all-competitors/all-competitors.component';
import { NewsComponent } from './news/news.component';
import { PrizingPageComponent } from './prizing-page/prizing-page.component';
import { ChampionsPageComponent } from './champions-page/champions-page.component';
import { RulesPageComponent } from './rules-page/rules-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { FaqComponent } from './faq/faq.component';
import { ResultsComponent } from './results/results.component';
import { LiveResultsComponent } from './live-results/live-results.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'divisions', component: DivisionsComponent },
  { path: 'division/:id', component: DivisionComponent },
  { path: 'scores', component: ScoresComponent },
  { path: 'competitors', component: AllCompetitorsComponent },
  { path: 'competitors/:id', component: CompetitorsComponent },
  { path: 'news', component: NewsComponent },
  { path: 'prizing', component: PrizingPageComponent },
  { path: 'champions', component: ChampionsPageComponent },
  { path: 'rules', component: RulesPageComponent },
  { path: 'contact', component: ContactPageComponent },
  { path: 'subscribe', component: SubscribeComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'results', component: ResultsComponent },
  { path: 'results/live', component: LiveResultsComponent},
  { path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

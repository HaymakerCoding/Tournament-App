import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { CMPCmatch } from '../models/CMPCmatch';
import { Subscription } from 'rxjs';
import { CmpcService } from '../services/cmpc.service';
import { TournamentBase } from '../tournamentBase';
import { TournamentService } from '../services/tournament.service';
import { Title } from '@angular/platform-browser';
import { PlayerScores } from '../models/PlayerScores';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Results specific to City Match Play Championship.
 * CMPC matches are played as part of Slammer Tour events.
 * So we need to specifically bring in some slammer tour event data to set live results for this tournament
 * 
 * @author Malcolm roy
 */
@Component({
  selector: 'app-cmpc-live',
  templateUrl: './cmpc-live.component.html',
  styleUrls: ['./cmpc-live.component.scss']
})
export class CmpcLiveComponent extends TournamentBase implements OnDestroy, OnInit {

  
  events: CMPCevent[];
  holes: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  constructor(
    tournamentService: TournamentService,
    titleService: Title,
    private cmpcService: CmpcService,
    private snackbar: MatSnackBar
  ) {
    super(tournamentService, titleService);
   }

  ngOnInit() {
    super.ngOnInit()
  }

  ngOnDestroy() {
    super.ngOnDestroy()
  }

  next() {
    this.getCMPCmatches();
  }

   /**
   * Fetch all matches that are flagged as CMPC. These can be single or doubles format, organized as such.
   * Payload contains both the events and the matches
   */
  getCMPCmatches() {
    this.subscriptions.push(this.tournamentService.getCMPCmatchesForToday().subscribe(response => {
      if (response.status === 200) {
        console.log(response);
        if (response.payload) {
          const cmpcMatches: any[] = response.payload.matches;
          this.events = response.payload.events;
          this.events.forEach(e => {
            e.CMPCsingles = [];
            e.CMPCdoubles = [];
          });
          cmpcMatches.forEach(match => {
            if (match.type === 'Singles') {
              this.events.find(event => +event.id === +match.eventId).CMPCsingles.push(match);
            } else {
              this.events.find(event => +event.id === +match.eventId).CMPCdoubles.push(match);
            }
          });
        }
        this.setLoadingPercent(50);
        this.events.forEach(event => {
          this.setPars(event);
        });
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Grab the pars associated to an event. Do this for all events
   * @param event CMPC Event ojb
   */
  setPars(event: CMPCevent) {
    this.subscriptions.push(this.cmpcService.getPars(event.id.toString()).subscribe(response => {
      if (response.status === 200) {
        event.pars = response.payload;
      } else {
        console.error(response);
      }
      if (this.haveFoundAllPars() === true) {
        this.setLoadingPercent(70);
        this.events.forEach(event => {
          this.getEventScores(event, false);
        });
      }
    }))
  }

  haveFoundAllPars(): boolean{
    let foundAll: boolean = true;
    this.events.forEach(x => {
      if (x.pars && x.pars.length > 0) {
        // all good
      } else {
        foundAll = false;
      }
    })
    return foundAll;
  }

  /**
   * Get and set all scores (If any entered) for an event. Do for all events.
   * Note may need to reconfigure these to pull all data at once from server when getting events. Not sure about server ability to handle multiple HTTP requests too close together.
   * @param event 
   */
  getEventScores(event: CMPCevent, refresh: boolean) {
    this.subscriptions.push(this.cmpcService.getScores(event.id.toString()).subscribe(response => {
      if (response.status === 200) {
        event.playerScores = response.payload;
      } else {
        console.error(response);
      }
      if (this.haveFoundAllScores() === true && refresh === false) {
        this.setLoadingPercent(100);
      } else if (refresh === true) {
        this.snackbar.open('New Scores Loaded!', '', { duration: 1000 });
      }
    }));
  }

  refreshScores() {
    this.events.forEach(event => {
      this.getEventScores(event, true);
    });
  }

  haveFoundAllScores(): boolean {
    let foundAll: boolean = true;
    this.events.forEach(x => {
      if (x.playerScores) {
        // all good
      } else {
        foundAll = false;
      }
    })
    return foundAll;
  }

  /**
   * Return the par for a certain hole
   * @param event CMPC Event obj
   * @param hole Hole number
   */
  getHolePar(event: CMPCevent, hole: number) {
    return event.pars.find(x => +x.hole === hole).par;
  }

  /**
   * Get status of holes complete between 2 players
   * @param player1id player 1 slammer id
   * @param player2id player 2 slammer id
   */
  getHolesComplete2players(event: CMPCevent, player1id:number, player2id: number): number {
    let holesComplete = 0;
    let p1score: number;
    let p2score: number;
    for (const hole of this.holes) {
      p1score = this.getHoleScore(event, +player1id, hole);
      p2score = this.getHoleScore(event, +player2id, hole);
      if (!p1score && !p2score ) {
        return holesComplete;
      } else {
        holesComplete++;
      }
    }
    return holesComplete;
  }

  getHolesCompleteByPlayer(event: CMPCevent, playerId: number) {
    let holesComplete = 0;
    let pscore;
    for (const hole of this.holes) {
      if (playerId) {
        pscore = this.getHoleScore(event, playerId, hole);
      }
      if (!pscore) {
        return holesComplete;
      } else {
        holesComplete++;
      }
    }
    return holesComplete;
  }

  /**
   * Get status of holes complete in a DOUBLES CMPC specific match
   * @param match CMPC match obj containing all players, 4 for doubles
   */
  getHolesCompleteCMPCdoubles(event: CMPCevent, match: CMPCmatch) {
    let holesComplete = 0;
    let p1score: number;
    let p2score: number;
    let p3score: number;
    let p4score: number;
    for (const hole of this.holes) {
      p1score = this.getHoleScore(event, +match.player1id, hole);
      p2score = this.getHoleScore(event, +match.player2id, hole);
      p3score = this.getHoleScore(event, +match.player1partnerId, hole);
      p4score = this.getHoleScore(event, +match.player2partnerId, hole);
      if (!p1score && !p2score && !p3score && !p4score ) {
        return holesComplete;
      } else {
        holesComplete++;
      }
    }
    return holesComplete;
  }

  /**
   * Get a players score for a hole
   * @param playerId Player Slammer ID
   * @param hole hole number
   */
  getHoleScore(event: CMPCevent, playerId: number, hole:number): number  {
    const playerScores = event.playerScores.find(x => +x.slammerId === +playerId);
    if (playerScores && playerScores.scores) {
      const score = playerScores.scores.find( x => x.hole === hole).score;
      return score > 0 ? score : null;
    } else {
      return null;
    }
  }

  /**
   * Get a result between 2 players up to a certain point.
   * The lower score on the hole wins 1 point for that hole.
   * If a player is up by more points than holes left than match is over result wise
   * @param holes An array of hole numbers for all holes up to the one currently selected
   * @param activePlayerNumber The group number for the selected player
   * @param opponentNumber The group number for the opponent comparing with
   */
  calcuteResult(event:CMPCevent, activePlayerNumber: number, opponentNumber: number, match: CMPCmatch): string {
    let p1Total = 0;
    let p2Total = 0;
    let holesLeftToPlay = 18;
    let msg: string;
    for (const hole of this.holes) {
      if (hole <= this.getHolesCompleteByPlayer(event, activePlayerNumber)) {
        holesLeftToPlay = 18 - hole;
        const p1score: number = +this.getHoleScore(event, activePlayerNumber, hole);
        const p2score: number = +this.getHoleScore(event, opponentNumber, hole);
        if (p1score < p2score) {
          p1Total++;
        } else if (p2score < p1score) {
          p2Total++;
        }
        if (holesLeftToPlay === 0 && p1Total === p2Total && activePlayerNumber !== opponentNumber) {
          // IF we have a playoff winner SET then that means there was a playoff and we need to show that winner, else regular 'draw' text is return
          const activePlayerName = match.player1id === activePlayerNumber ? match.player1name : match.player2name;
          return (match && match.playoffWinner) ? match.playoffWinner === activePlayerName ? 'Playoff Winner' : 'Playoff Loser' : 'Draw';
        } else if (holesLeftToPlay === 0 && p1Total > p2Total && (p1Total - p2Total === 2)) {
          return 'Won 2 up';
        } else if (p1Total > (p2Total + holesLeftToPlay)) {
          return 'Won ' + (p1Total - p2Total) + ' and ' + holesLeftToPlay;
        } else if(p2Total > (p1Total + holesLeftToPlay)) {
          return'Lost ' + (p2Total - p1Total) + ' and ' + holesLeftToPlay;
        } 
      }
    }
    // If we get to this point that means the match is not finished, so we show the status of the match as far as up or down x points vs other player
    const difference = p1Total > p2Total ? (p1Total - p2Total) : p2Total > p1Total ? (p2Total - p1Total) : 0;
    if (activePlayerNumber === opponentNumber) {
      return null;
    }
    return p1Total > p2Total ? difference + ' Up' : p2Total > p1Total ? difference + ' Down' : 'All Square';
  }

  /**
   * Get results of a match between doubles.
   * player 1 and player2(parnters) scores are added together for each hole and compared against player 3 and 4(partners).
   * The team with lower score for the hole gets the point for that hole
   * @param match CMPM match obj containing all 4 doubles players
   */
  getMatchResultCMPCdoubles(event: CMPCevent, match: CMPCmatch, pair: number) {
    let pair1Total = 0;
    let pair2Total = 0;
    let holesLeftToPlay = 18;
    for (const hole of this.holes) {
      holesLeftToPlay = 18 - +hole;
      if (hole <= this.getHolesCompleteByPlayer(event, match.player1id)) {
        const pair1score = +this.getHoleScore(event, match.player1id, hole) + +this.getHoleScore(event, match.player1partnerId, hole);
        const pair2score = +this.getHoleScore(event, match.player2id, hole) + +this.getHoleScore(event, match.player2partnerId, hole);
        if (pair1score < pair2score) {
          pair1Total++;
        } else if (pair2score < pair1score) {
          pair2Total++;
        }
        if (holesLeftToPlay === 0 && pair1Total === pair2Total) {
          return 'Draw';
        } else if (holesLeftToPlay === 0 && pair1Total > pair2Total && (pair1Total - pair2Total === 2)) {
          return 'Won 2 up';
        } else if (pair1Total > (+pair2Total + +holesLeftToPlay)) {
          if (pair === 1) {
            return 'Won ' + (pair1Total - pair2Total) + ' and ' + holesLeftToPlay;
          } else {
            return'Lost ' + (pair1Total - pair2Total) + ' and ' + holesLeftToPlay;
          }
        } else if(pair2Total > (+pair1Total + +holesLeftToPlay)) {
          if (pair === 1) {
            return'Lost ' + (pair2Total - pair1Total) + ' and ' + holesLeftToPlay;
          } else {
            return 'Won ' + (pair2Total - pair1Total) + ' and ' + holesLeftToPlay;
          }
        }
      }
    }
    const difference = pair1Total > pair2Total ? (pair1Total - pair2Total) : pair2Total > pair1Total ? (pair2Total - pair1Total) : 0;
    if (pair1Total === pair2Total) {
      return 'All Square';
    } else {
      if (pair === 1) {
        return pair1Total > pair2Total ? difference + ' Up' : difference + ' Down';
      } else {
        return pair2Total > pair1Total ? difference + ' Up' : difference + ' Down';
      }
    }
  }

 

}

interface CMPCevent{
  id: number;
  name: string;
  date: any;
  time: any;
  pars: Par[];
  playerScores: PlayerScores[];
  CMPCsingles: CMPCmatch[];
  CMPCdoubles: CMPCmatch[];
  playoffWinner: string;
}

interface Par{
  hole: number;
  par: number
}

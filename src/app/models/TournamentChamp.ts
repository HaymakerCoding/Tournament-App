
/**
 * Represent tournament Champion. Specific to a year of the tournament
 * @author Malcolm Roy
 */
export class TournamentChamp {

  constructor(
      public id: number,
      public tournamentId: number,
      public divisionId: number,
      public type: string,
      public tournamentYear: number,
      public memberId: number,
      public fullName: string,
      public partnerId: number,
      public partnerName: string,
      public score: number,
      public caption: string,
      public pic: string
  ) {}

}

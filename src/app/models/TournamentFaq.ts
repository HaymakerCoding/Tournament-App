
/**
 * Represent an clubEG tournament FAQ
 * @author Malcolm Roy
 */
export class TournamentFaq {

  constructor(
      public id: number,
      public tournamentId: number,
      public text: string,
      public lastUpdated: any,
      public updatedBy: number,
      public orderNum: number
  ) {}

}

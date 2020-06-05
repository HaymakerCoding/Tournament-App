
/**
 * Represent basic info for a course used in a tournament
 * @author Malcolm Roy
 */
export class TournamentNewsItem {

  constructor(
      public id: number,
      public tournamentId: number,
      public newsDate: any,
      public header: string,
      public content: string,
      public link: string
  ) {}

}

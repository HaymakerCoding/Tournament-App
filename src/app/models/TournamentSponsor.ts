
/**
 * Represent basic info for a course used in a tournament
 * @author Malcolm Roy
 */
export class TournamentSponsor {

  constructor(
      public id: number,
      public name: string,
      public website: string,
      public logo: string,
      public defaultAd: string,
      public currentAd: string,
      public currentAdWebsite: string
  ) {}

}

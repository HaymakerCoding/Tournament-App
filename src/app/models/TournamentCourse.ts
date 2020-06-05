
/**
 * Represent basic info for a course used in a tournament
 * @author Malcolm Roy
 */
export class TournamentCourse {

  constructor(
      public id: number,
      public name: string,
      public fullName: string,
      public type: string,
      public logo: string,
      public num: number, // ordering on website
      public courseId: number
  ) {}

}

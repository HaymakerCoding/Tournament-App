
/**
 * Represent an clubEG member, basic data for listing
 * @author Malcolm Roy
 */
export class BasicMember {

  constructor(
      public memberId: number,
      public fullName: string,
      public nickname: string,
      public pic: string,
      public driving: number,
      public clubegScoringAvg: number,
      public averageScore: number,
      public teeBlock: string
  ) {}

}

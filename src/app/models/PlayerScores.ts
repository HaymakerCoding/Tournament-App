
/**
 * Represent a player and their scores
 * @author Malcolm Roy
 */
export class PlayerScores {

  constructor(
      public slammerId: number,
      public fullName: string,
      public nickname: string,
      public scores: Score[],
      public total: number
  ) {}

}

interface Score {
  hole: number;
  score: number;
}


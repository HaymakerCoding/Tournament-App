
/**
 * A group of golfer playing in a league or tournament event.
 * up to 4 players
 * @author Malcolm Roy
 */
export class Group {

  constructor(
      public id: number,
      public eventId: number,
      public teeTime: any,
      public startHole: number,
      public matches: Match[]
  ) {}

}

export class Match {

  constructor(
    public id: number,
    public seasonId: number,
    public eventId: number,
    public groupId: number,
    public type: any,
    public player1id: number,
    public player2id: number,
    public player3id: number,
    public player4id: number,
    public player1name: string,
    public player2name: string,
    public player3name: string,
    public player4name: string,
    public round1id: number,
    public round2id: number,
    public round3id: number,
    public round4id: number
  ) {}
}




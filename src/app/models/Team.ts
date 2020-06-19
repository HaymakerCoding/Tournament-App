
/**
 * Represent an tournament team
 * @author Malcolm Roy
 */
export class Team {

  constructor(
    public id: number,
    public name: string,
    public captain: string,
    public captainMemberId: number,
    public captainPic: string
  ) {}

}


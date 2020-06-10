
/**
 * Represent a City Match Play Championship tournament match
 * @author Malcolm Roy
 */
export class CMPCmatch {

  constructor(
    public id: number,
    public division: string,
    public round: string,
    public eventId: number,
    public type: string,
    public player1id: number,
    public player1name: string,
    public player1partnerId: number,
    public player1partnerName: string,
    public player2id: number,
    public player2name: string,
    public player2partnerId: number,
    public player2partnerName: string,
    public result: string,
    public updatedAt: any,
    public playoffWinner: string,
    public courseId: number,
    public courseName: string,
    public courseLogo: string,
    public date: any,
    public time: any,
    public pars: Par[] 
  ) {}

}

export interface Par{
  hole: number,
  par: number
}



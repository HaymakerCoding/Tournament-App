import { BasicMember } from './BasicMember';
import { Individual } from './Individual';
import { HoleScore } from './HoleScore';
import { EventParticipant } from './EventParticipant';

/**
 * Represent an tournament team
 * @author Malcolm Roy
 */
export class Team extends EventParticipant   {

  constructor(
    public id: number,
    public name: string,
    public captain: string,
    public captainMemberId: number,
    public captainPic: string,
    public members: BasicMember[],
    public participantId: number,
    public teamId: number,
    public teamParticipantId: number,
    public groupParticipantId: number,
    public teamMembers: Individual[],
    public holeScores: HoleScore[],
    public score: number,
    public scoreId: number,
    public pos: any,
    public roundScores: RoundScores[],
    public totalScore: number
  ) {
    super(
      participantId
    );
  }

}

export interface RoundScores {
  eventId: number;
  score: string;
}


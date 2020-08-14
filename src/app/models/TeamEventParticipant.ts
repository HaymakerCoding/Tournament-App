import { EventParticipant } from './EventParticipant';

/**
 * A competitor that is participating in an event
 * @author Malcolm Roy
 */
export class TeamEventParticipant {

  constructor(
      public teamId: number,
      public teamParticipantId: number,
      public eventParticipants: EventParticipant[]
  ) {}

}




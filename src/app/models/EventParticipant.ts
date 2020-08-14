
/**
 * A competitor that is participating in an event
 * @author Malcolm Roy
 */
export class EventParticipant {

  constructor(
      public id: number,
      public eventId: number,
      public competitionId: number,
      public type: string,
      public registered: boolean,
      public memberId: number,
      public fullName: string,
      public participating: boolean, // Just a marker for adding/removing from participant list when sending a full list
      public individualId: number,
      public participantId: number
  ) {}

}




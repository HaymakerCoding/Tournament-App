
/**
 * Represent a tournament Registration
 * @author Malcolm Roy
 */
export class Registration {

  constructor(
      public id: number,
      public tournamentId: number,
      public divisionId: number,
      public year: number,
      public fullName: string,
      public status: string,
      public memberId: number,
      public partnerId: number,
      public partnerFullName: string,
      public updatedAt: any
  ) {}

}

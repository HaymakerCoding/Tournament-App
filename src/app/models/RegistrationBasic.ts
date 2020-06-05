import { Division } from './Division';

/**
 * Represent a tournament Registration, just basic info for listing
 * @author Malcolm Roy
 */
export class RegistrationBasic {

  constructor(
      public id: number,
      public tournamentId: number,
      public divisionId: number,
      public yearId: number,
      public fullName: string,
      public status: string,
      public partnerId: number,
      public partnerFullName: string,

  ) {}

}

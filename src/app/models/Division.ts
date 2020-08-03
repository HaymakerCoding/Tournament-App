import { DivisionSponsor } from './DivisionSponsor';

/**
 * Represent a tournament Division
 * @author Malcolm Roy
 */
export class Division {

  constructor(
      public id: number,
      public competitionId: number,
      public seasonId: number,
      public num_events: number,
      public name: string,
      public type: string,
      public spots: number,
      public partnerEntered: number,
      public partnerName: string,
      public qualifierSpots: number,
      public price: any,
      public memberPrice: any,
      public priceText: any,
      public eligibility: string,
      public sponsorId: number,
      public sponsorPic: string,
      public teeBlock: string,
      public regOpen: any,
      public regClosed: any,
      public ruleText: string,
      public logo1id: number,
      public logo1type: string,
      public logo2id: number,
      public logo2type: string,
      public logo3id: number,
      public logo3type: string,
      public logo1: string,
      public logo2: string,
      public logo3: string,
      public logo1link: string,
      public logo2link: string,
      public logo3link: string,
      public sponsorLink: string,
      public adSetting: string,
      public sponsor: DivisionSponsor

  ) {}

}

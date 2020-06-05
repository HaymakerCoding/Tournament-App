import { Rule } from './Rule';

/**
 * Represent a golf tournament all info for displaying a web site
 * @author Malcolm Roy
 */
export class Tournament {

  constructor(
    public id: number,
    public url: string,
    public name: string,
    public host: string,
    public about: string,
    public featureImage: string,
    public logo: string,
    public presentedByLogo: string,
    public headerImage: string,
    public phoneHeader: string,
    public useLogo: any,
    public usePresentedBy: any,
    public useNameImage: any,
    public navColor: string,
    public buttonColor: string,
    public rulesLastUpdated: any,
    public rulesHeader: string,
    public phoneFeature: string,
    public header: string,
    public subHeader: string,
    public trophyPic: string,
    public prizingText: string,
    public scoringLink: string,
    public courseDomain: string
  ) {}

}

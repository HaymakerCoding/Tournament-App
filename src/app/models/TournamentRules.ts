import { Rule } from './Rule';

/**
 * Represent an clubEG tournament Rule, made of sections of rules
 * @author Malcolm Roy
 */
export class TournamentRules {

  constructor(
      public sectionId,
      public sectionText,
      public tournamentId,
      public rules: Rule[]
  ) {}

}

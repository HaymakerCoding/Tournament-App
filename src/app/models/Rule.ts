
/**
 * Represent an clubEG golf rule generic rule that can be assigned to sections and then those sections to a tournament/event
 * @author Rule
 */
export class Rule {

  constructor(
    public id,
    public text,
    public lastUpdated,
    public updatedBy
  ) {}

}


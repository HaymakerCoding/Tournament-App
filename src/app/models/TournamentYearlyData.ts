import { TournamentCourse } from './TournamentCourse';
import { TournamentSponsor } from './TournamentSponsor';

/**
 * Represent a tournament info that is specific to a year
 * @author Malcolm Roy
 */
export class TournamentYearlyData {

  constructor(
    public id: number,
    public tournamentId: number,
    public year: number,
    public date: any,
    public time: any,
    public sponsors: TournamentSponsor[],
    public courses: TournamentCourse[],
    public qualifying: QualifyingStatus
  ) { }

}

enum QualifyingStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

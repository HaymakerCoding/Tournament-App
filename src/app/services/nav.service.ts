import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  private state = new Subject();

  constructor() {
    this.setState(ScrollState.NONE);
  }

  getState() {
    return this.state;
  }
  setState(state: ScrollState) {
    this.state.next(state);
  }
}

export enum ScrollState {
  NONE,
  NEWS,
  COMPETITOR,
  PRIZING,
  RULES,
  CONTACT
}

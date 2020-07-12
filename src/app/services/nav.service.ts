import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Navigation Service, allows a link between Home component and Nav component.
 * Home component subscribes to this service and listens to changes, which triggers scrolling on home page.
 * Nav component can send changes to this service.
 * 
 * @author Malcolm Roy
 */
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
  CONTACT,
  TOP
}

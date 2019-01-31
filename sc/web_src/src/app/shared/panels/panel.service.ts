import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PanelService {
  public controlLeft = new BehaviorSubject(null);
  public controlRight = new BehaviorSubject(null);
  public controlBottom = new BehaviorSubject(null);

  constructor() { }

}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideNavbarService {
  openSubject: Subject<any> = new Subject<any>();

  constructor() { }
}

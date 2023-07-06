import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  input: Subject<any> = new Subject();
  output: Subject<any> = new Subject();

  constructor() { }
  public openModal(config: ModalConfig) {
    this.input.next(config);
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastInput } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public data: Subject<ToastInput> = new Subject<ToastInput>();

  constructor() { }

  public displayToast(message: string, icon: string) {
    this.data.next({
      message: message,
      icon: icon,
    });
  }
}

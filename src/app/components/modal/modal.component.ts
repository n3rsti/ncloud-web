import {Component, HostListener, Input} from '@angular/core';
import {ModalConfig, ModalOutput} from "../../interfaces";
import {Subject} from "rxjs";
import {Modal} from "flowbite";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent){
    if(event.key === 'Escape'){
      this.opened = false;
    }
  }


  @Input() inputSubject: Subject<any> = new Subject();
  @Input() outputSubject: Subject<any> = new Subject();
  Config: ModalConfig | null = null;
  opened = false;

  ngOnInit(){
    this.inputSubject.subscribe((data: ModalConfig) => {
      this.Config = data;
      this.opened = true;
    })
  }

  onSubmit(){
    let output: ModalOutput = {
      subjectName: this.Config?.subjectName,
      value: this.Config?.data
    }
    this.outputSubject.next(output);
    this.opened = false;
  }
}

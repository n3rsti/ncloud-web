import {Component, ElementRef, HostListener, Input, QueryList, ViewChild, ViewChildren} from '@angular/core';
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
    if(event.key === 'Enter'){
      this.onSubmit();
    }
  }
  @ViewChildren("modalInput") modalInput: QueryList<ElementRef<HTMLInputElement>> | undefined;

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
      subjectName: this.Config?.subjectName || '',
      value: this.Config?.data
    }

    let formValues: Record<string, any> = {};
    if(this.modalInput){
      this.modalInput.forEach(element => {
        formValues[element.nativeElement.name] = element.nativeElement.value;
      })

      output.formValues = formValues;
    }





    this.outputSubject.next(output);
    this.opened = false;



  }
}

import {Component, HostListener, Input} from '@angular/core';
import {FileBuilder, FileModel} from "../../models/file.model";
import {Subject} from "rxjs";

@Component({
  selector: 'app-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss']
})
export class FileDetailsComponent {
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent){
    if(event.key === 'Escape'){
      this.opened = false;
    }
  }

  @Input() files: FileModel[] = [];
  @Input() openedSubject: Subject<any> = new Subject<any>();

  fileCounter = 0;
  opened = false;

  ngOnInit(){
    this.openedSubject.subscribe({
      next: (data) => {
        this.fileCounter = data;
        this.opened = true;
      }
    })
  }
}

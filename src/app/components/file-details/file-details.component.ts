import {Component, HostListener, Input} from '@angular/core';
import {FileBuilder, FileModel} from "../../models/file.model";
import {Subject} from "rxjs";
import {ConstNames} from "../../constants";
import {Directory} from "../../models/directory.model";

@Component({
  selector: 'app-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss']
})
export class FileDetailsComponent {
  ConstNames = ConstNames
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.opened = false;
    }
  }

  @Input() files: FileModel[] = [];
  @Input() directories: Directory[] = [];
  @Input() openedSubject: Subject<any> = new Subject<any>();

  itemIndex = 0;
  opened = false;
  type = '';
  title = '';

  ngOnInit() {
    this.openedSubject.subscribe({
      next: (data) => {
        this.itemIndex = data["index"];
        this.opened = true;
        this.type = data["type"];
        this.title = data["title"];
      }
    })
  }
}

import {Component, HostListener, Input} from '@angular/core';
import {FileModel} from "../../models/file.model";
import {Directory, DirectoryBuilder} from "../../models/directory.model";
import {Subject} from "rxjs";
import {ConstNames} from "../../constants";

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent {
  ConstNames = ConstNames

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.opened = false;
    }
  }

  @Input() directory: Directory = new DirectoryBuilder().build();
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
  
  // These functions are in FileModel as well, but there is a bug where a new uploaded file can't access these methods, even though they are typof FileModel
  getCreationDate(id: string){
    return new Date(parseInt(id.substring(0, 8), 16) * 1000).toLocaleString();
  }

  getHumanReadableSize(size: number): string {
    let bytes = size
    let dp = 1;


    const thresh = 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }
}

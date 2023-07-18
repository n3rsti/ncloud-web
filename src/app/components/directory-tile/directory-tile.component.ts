import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Directory, DirectoryBuilder } from '../../models/directory.model';

@Component({
  selector: 'app-directory-tile',
  templateUrl: './directory-tile.component.html',
  styleUrls: ['./directory-tile.component.scss'],
})
export class DirectoryTileComponent {
  @Input() directory: Directory = new DirectoryBuilder().build();
  @Input() selectedList: Directory[] = [];

  @ViewChild('directoryTile', { static: false }) directoryTile:
    | ElementRef
    | undefined;

  @Output() dropEventEmitter = new EventEmitter<string>();

  addHoverClass() {
    this.directoryTile?.nativeElement.classList.add('bg-gray-100');
  }

  removeHoverClass() {
    this.directoryTile?.nativeElement.classList.remove('bg-gray-100');
  }

  dropEvent(event: any) {
    event.preventDefault();
    if (event.dataTransfer.types.length == 0) {
      this.dropEventEmitter.emit(this.directory.id);
    }
  }
}

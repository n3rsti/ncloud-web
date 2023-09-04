import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DirectoryService } from 'src/app/services/directory.service';
import { Directory, DirectoryBuilder } from '../../models/directory.model';

@Component({
  selector: 'app-directory-tile',
  templateUrl: './directory-tile.component.html',
  styleUrls: ['./directory-tile.component.scss'],
})
export class DirectoryTileComponent {
  @Input() directory: Directory = new DirectoryBuilder().build();

  constructor(private directoryService: DirectoryService) { }

  get selectedList() {
    return this.directoryService.selectedDirectories;
  }

  @ViewChild('directoryTile', { static: false }) directoryTile:
    | ElementRef
    | undefined;

  @Output() dropEventEmitter = new EventEmitter<string>();

  addHoverClass() {
    this.directoryTile?.nativeElement.classList.add('bg-gray-800');
  }

  removeHoverClass() {
    this.directoryTile?.nativeElement.classList.remove('bg-gray-800');
  }

  dropEvent(event: any) {
    event.preventDefault();
    if (event.dataTransfer.types.length == 0) {
      this.dropEventEmitter.emit(this.directory.id);
    }
    this.removeHoverClass();
  }
}

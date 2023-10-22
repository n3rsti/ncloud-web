import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Directory, DirectoryBuilder } from 'src/app/models/directory.model';
import { DirectoryService } from 'src/app/services/directory.service';

@Component({
  selector: 'app-directory-row',
  templateUrl: './directory-row.component.html',
  styleUrls: ['./directory-row.component.scss']
})
export class DirectoryRowComponent {
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


  get shortDate() {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }

    return new Intl.DateTimeFormat("en-GB", options).format(this.directory.creationDate);
  }
}

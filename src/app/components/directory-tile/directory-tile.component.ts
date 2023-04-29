import {Component, Input} from '@angular/core';
import {Directory, DirectoryBuilder} from "../../models/directory.model";

@Component({
  selector: 'app-directory-tile',
  templateUrl: './directory-tile.component.html',
  styleUrls: ['./directory-tile.component.scss']
})
export class DirectoryTileComponent {
  @Input() directory: Directory = new DirectoryBuilder().build();
}

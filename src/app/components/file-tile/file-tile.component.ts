import {Component, Input} from '@angular/core';
import {FileBuilder, FileModel} from "../../models/file.model";

@Component({
  selector: 'app-file-tile',
  templateUrl: './file-tile.component.html',
  styleUrls: ['./file-tile.component.scss']
})
export class FileTileComponent {
  @Input() file: FileModel = new FileBuilder().build();

  getImgDetails(event: any, file: FileModel) {
    const img = event.target;

    if (file.additional_data == null) {
      file.additional_data = [
        {name: 'Resolution', value: `${img.naturalWidth}x${img.naturalHeight}`}
      ]
    } else {
      file.additional_data.push(
        {name: 'Resolution', value: `${img.naturalWidth}x${img.naturalHeight}`}
      )
    }
  }
}

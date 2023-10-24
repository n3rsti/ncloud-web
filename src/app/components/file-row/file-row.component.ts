import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileBuilder, FileModel } from 'src/app/models/file.model';
import { DirectoryService } from 'src/app/services/directory.service';
import { FileFormats } from 'src/app/utils';

@Component({
  selector: 'app-file-row',
  templateUrl: './file-row.component.html',
  styleUrls: ['./file-row.component.scss']
})
export class FileRowComponent {
  @Input() file: FileModel = new FileBuilder().build();
  highlightedFile: string = '';

  icon = '';
  color = '';

  @ViewChild('btn', { static: false }) btn: ElementRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private directoryService: DirectoryService
  ) { }

  ngOnInit() {
    this.icon = FileFormats.getIcon(this.file.type);
    this.color = FileFormats.ICON_TO_COLOR[this.icon] || 'indigo-700';

    this.route.queryParams.subscribe((params) => {
      this.highlightedFile = params['file'];
      if (this.highlightedFile === this.file.id) {
        this.btn?.nativeElement.focus();
      }
    });
  }

  getImgDetails(event: any, file: FileModel) {
    const img = event.target;

    if (file.additional_data == null) {
      file.additional_data = [
        {
          name: 'Resolution',
          value: `${img.naturalWidth}x${img.naturalHeight}`,
        },
      ];
    } else if (file.additional_data.filter(x => x.name === "Resolution").length === 0) {
      file.additional_data.push({
        name: 'Resolution',
        value: `${img.naturalWidth}x${img.naturalHeight}`,
      });
    }
  }

  get shortDate() {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }

    console.log(this.file, this.file.created)

    return new Intl.DateTimeFormat("en-GB", options).format(this.file.created);
  }

  get selectedList() {
    return this.directoryService.selectedFiles;
  }
}

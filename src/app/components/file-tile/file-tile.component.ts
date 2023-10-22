import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FileBuilder, FileModel } from '../../models/file.model';
import { ActivatedRoute } from '@angular/router';
import { FileFormats } from '../../utils';
import { DirectoryService } from 'src/app/services/directory.service';

@Component({
  selector: 'app-file-tile',
  templateUrl: './file-tile.component.html',
  styleUrls: ['./file-tile.component.scss'],
})
export class FileTileComponent {
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

  get selectedList() {
    return this.directoryService.selectedFiles;
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

  ngAfterViewInit() {
    if (this.highlightedFile === this.file.id) {
      this.btn?.nativeElement.focus();
    }
  }
}

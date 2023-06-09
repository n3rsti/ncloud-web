import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FileBuilder, FileModel} from "../../models/file.model";
import {ActivatedRoute} from "@angular/router";
import {FileFormats} from "../../utils";

@Component({
  selector: 'app-file-tile',
  templateUrl: './file-tile.component.html',
  styleUrls: ['./file-tile.component.scss']
})
export class FileTileComponent {
  @Input() file: FileModel = new FileBuilder().build();
  highlightedFile: string = '';

  icon = '';
  color = '';

  @Input() selectedList: Set<string> = new Set();

  @ViewChild('btn', {static: false}) btn: ElementRef | undefined;


  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.highlightedFile = params["file"];
      if(this.highlightedFile === this.file.id){
        this.btn?.nativeElement.focus();
      }
    })
  }

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

  ngAfterViewInit(){
    if(this.highlightedFile === this.file.id){
      this.btn?.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.icon = FileFormats.getIcon(this.file.type);
    this.color = FileFormats.ICON_TO_COLOR[this.icon] || "indigo-700";
  }
}

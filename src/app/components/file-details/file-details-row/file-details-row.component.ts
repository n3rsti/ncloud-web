import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-file-details-row',
  templateUrl: './file-details-row.component.html',
  styleUrls: ['./file-details-row.component.scss']
})
export class FileDetailsRowComponent {
  @Input() value: string | number = '';
  @Input() name: string = '';
 }

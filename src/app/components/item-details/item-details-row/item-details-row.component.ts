import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-item-details-row',
  templateUrl: './item-details-row.component.html',
  styleUrls: ['./item-details-row.component.scss']
})
export class ItemDetailsRowComponent {
  @Input() value: string | number = '';
  @Input() name: string = '';
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-icon',
  templateUrl: './custom-icon.component.html',
  styleUrls: ['./custom-icon.component.scss'],
})
export class CustomIconComponent {
  @Input() icon: string = '';
  @Input() color: string | undefined = '';
}

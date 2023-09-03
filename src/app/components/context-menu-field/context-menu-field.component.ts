import { Component, Input } from '@angular/core';

interface Colors {
  background: string;
  text: string;
  opacity?: number;
}

@Component({
  selector: 'app-context-menu-field',
  templateUrl: './context-menu-field.component.html',
  styleUrls: ['./context-menu-field.component.scss'],
})
export class ContextMenuFieldComponent {
  @Input() icon: string = '';
  @Input() colors: Colors = {
    background: 'gray-800',
    text: 'gray-400',
  };
}

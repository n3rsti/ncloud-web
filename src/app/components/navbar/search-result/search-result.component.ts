import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent {
  @Input() value: string = '';
  @Input() sideText: string = '';
  @Input() icon: string = 'search';

  iconBackground: string = 'text-indigo-600'

  ngOnInit(){
    if(this.icon === 'trash'){
      this.iconBackground = 'text-red-600';
    }
  }
}
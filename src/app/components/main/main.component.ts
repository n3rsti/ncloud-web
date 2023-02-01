import { Component } from '@angular/core';
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  constructor(private data: DataService) {
  }

  ngOnInit(){
    this.data.getDirectory("").subscribe({
      next: (data) => {
        console.log(data);
      }
    })



  }
}

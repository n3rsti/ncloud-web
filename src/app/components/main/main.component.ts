import { Component } from '@angular/core';
import {DataService} from "../../services/data.service";
import {Directory, DirectoryBuilder} from "../../models/directory.model";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  directory: Directory = new DirectoryBuilder().build();

  constructor(private data: DataService) {
  }

  ngOnInit(){
    this.data.getDirectory("").subscribe({
      next: (data: Directory[]) => {
        this.directory = data[0];
      }
    })



  }
}

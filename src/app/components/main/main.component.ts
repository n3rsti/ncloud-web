import {Component} from '@angular/core';
import {DataService} from "../../services/data.service";
import {Directory, DirectoryBuilder} from "../../models/directory.model";
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl} from "@angular/forms";


const FILES_TO_DOWNLOAD = [
  'image/jpeg',
  'image/png'
]

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  newDirectoryName = new FormControl('');
  directory: Directory = new DirectoryBuilder().build();

  constructor(private data: DataService, public sanitizer: DomSanitizer) {
  }

  ngOnInit(){
    this.data.getDirectory("").subscribe({
      next: (data: Directory[]) => {
        this.directory = data[0];

        this.directory.files.forEach(file => {
          if(FILES_TO_DOWNLOAD.includes(file.type)){
            this.data.getFile(file.id).subscribe({
              next: (data) => {
                // Convert blob to URL
                const urlCreator = window.URL || window.webkitURL;
                file.src = this.sanitizer.bypassSecurityTrustUrl(urlCreator.createObjectURL(data));
              },
            })
          }
        })




      }
    })



  }

  newDirectory(){
    console.log(this.newDirectoryName.value);
  }
}

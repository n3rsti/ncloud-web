import {Component, HostListener} from '@angular/core';
import {DataService} from "../../services/data.service";
import {Directory, DirectoryBuilder} from "../../models/directory.model";
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {Subject} from "rxjs";


const FILES_TO_DOWNLOAD = [
  'image/jpeg',
  'image/png',
  'image/bmp'
]

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  newDirectoryName = new FormControl('');
  modalToggle = new FormControl('');
  directory: Directory = new DirectoryBuilder().build();
  directoryId: string = '';
  fileCarouselCounter = 0;
  fileCarouselSubject: Subject<any> = new Subject();

  constructor(private data: DataService, public sanitizer: DomSanitizer, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params["id"]) {
        this.directoryId = params["id"];
      }

      this.getDirectory();
    })


  }

  openFileCarousel(){
    this.fileCarouselSubject.next(true);
  }

  getDirectory() {
    this.data.getDirectory(this.directoryId).subscribe({
      next: (data: Directory[]) => {
        this.directory = data[0];

        this.directory.files.forEach(file => {
          if (FILES_TO_DOWNLOAD.includes(file.type)) {
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

  newDirectory() {
    if (this.newDirectoryName.value) {
      this.data.createDirectory(this.newDirectoryName.value, this.directory.id).subscribe({
        next: (data: Directory) => {
          if (data) {
            this.directory.directories.push(data);

            // Close modal
            this.modalToggle.setValue('');
          }
        }
      })
    }
  }
  fileInputDrop(event: any){
    event.preventDefault();
    this.data.uploadFiles(event.dataTransfer.files, this.directory.id).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.log(err.status);
      }
    });

  }
  preventEvent(event: any){
    event.preventDefault();
  }
}

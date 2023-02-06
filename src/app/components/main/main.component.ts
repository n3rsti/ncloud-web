import {Component} from '@angular/core';
import {DataService} from "../../services/data.service";
import {Directory, DirectoryBuilder} from "../../models/directory.model";
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {Subject} from "rxjs";
import {FileModel} from "../../models/file.model";


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
    const files: FileList = event.dataTransfer.files;
    event.preventDefault();
    this.data.uploadFiles(event.dataTransfer.files, this.directory.id).subscribe({
      next: (data: FileModel[]) => {
        // Combine data from API Response (id, name) with data from HTML Input (src, type)
        // to create FileModel object and push to already existing file list

        for(let i = 0; i < files.length; i++){
          let imgSrc: any = '';
          const reader = new FileReader();

          reader.addEventListener("load", () => {
            imgSrc = reader.result;
            let newFile = data[i];
            newFile.src = imgSrc;
            newFile.type = files[i].type;

            this.directory.files.push(newFile)

          }, false)

          reader.readAsDataURL(files[i]);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });

  }
  preventEvent(event: any){
    event.preventDefault();
  }
}

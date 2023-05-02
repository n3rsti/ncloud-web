import {Component, Input} from '@angular/core';
import {FileModel} from "../../models/file.model";
import {DataService} from "../../services/data.service";
import {Directory, DirectoryBuilder} from "../../models/directory.model";


const FILES_TO_DOWNLOAD = [
  'image/jpeg',
  'image/png',
  'image/bmp'
]
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  fileUploadPanelOpened = false;
  @Input() directory: Directory = new DirectoryBuilder().build();


  constructor(private data: DataService) {
  }
  preventEvent(event: any) {
    event.preventDefault();
  }

  fileUploadChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.uploadFiles(files);
      event.target.form.reset();
    }
  }

  uploadFiles(files: FileList) {
    this.data.uploadFiles(files, this.directory).subscribe({
      next: (data: FileModel[]) => {
        // Combine data from API Response (id, name) with data from HTML Input (src, type)
        // to create FileModel object and push to already existing file list

        for (let i = 0; i < files.length; i++) {
          let imgSrc: any = '';
          const reader = new FileReader();

          reader.addEventListener("load", () => {
            imgSrc = reader.result;

            let newFile = data[i];
            if (FILES_TO_DOWNLOAD.includes(files[i].type)) {
              newFile.src = imgSrc;
            } else {
              newFile.src = '';
            }
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

  mobileFileUpload(event: any) {
    const files = event.target[0].files || null;

    if (files && files.length > 0) {
      this.uploadFiles(files);

      // Reset and close form
      event.target.reset();
      this.fileUploadPanelOpened = false;
    }
  }

  fileInputDrop(event: any) {
    event.preventDefault();

    console.log(event)

    const files: FileList = event.dataTransfer.files;
    if(files.length > 0){
      this.uploadFiles(files);
    }

  }

}

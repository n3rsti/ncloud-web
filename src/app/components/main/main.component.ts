import {Component, ElementRef, ViewChild} from '@angular/core';
import {DataService} from "../../services/data.service";
import {Directory, DirectoryBuilder} from "../../models/directory.model";
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Subject} from "rxjs";
import {FileBuilder, FileModel} from "../../models/file.model";


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
  fileDetailsSubject: Subject<any> = new Subject();
  fileUploadPanelOpened = false;

  contextMenuId = 0;
  @ViewChild('contextMenu', {static: false}) contextMenu: ElementRef | undefined;

  constructor(private data: DataService, public sanitizer: DomSanitizer, private route: ActivatedRoute, public router: Router) {
  }

  ngOnInit() {
    document.addEventListener("click", (e) => {
      if (e.button === 0) {
        this.closeContextMenu();
      }
    })
    this.route.params.subscribe(params => {
      if (params["id"]) {
        this.directoryId = params["id"];
      }

      this.getDirectory();
    })


  }

  openFileCarousel() {
    this.fileCarouselSubject.next(true);
  }

  openFileDetails(i: number) {
    this.fileDetailsSubject.next(i);
  }

  getDirectory() {
    this.data.getDirectory(this.directoryId).subscribe({
      next: (data: Directory[]) => {
        this.directory = data[0];
        if (this.directory.name === "") {
          this.directory.name = "Main folder";
        }

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

  fileInputDrop(event: any) {
    event.preventDefault();

    const files: FileList = event.dataTransfer.files;
    this.uploadFiles(files);
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
    this.data.uploadFiles(files, this.directory.id).subscribe({
      next: (data: FileModel[]) => {
        // Combine data from API Response (id, name) with data from HTML Input (src, type)
        // to create FileModel object and push to already existing file list

        for (let i = 0; i < files.length; i++) {
          let imgSrc: any = '';
          const reader = new FileReader();

          reader.addEventListener("load", () => {
            imgSrc = reader.result;

            let newFile = new FileBuilder()
              .setId(data[i].id)
              .setName(data[i].name)
            if (FILES_TO_DOWNLOAD.includes(files[i].type)) {
              newFile.src = imgSrc;
            } else {
              newFile.src = '';
            }
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

  mobileFileUpload(event: any) {
    const files = event.target[0].files || null;

    if (files && files.length > 0) {
      this.uploadFiles(files);

      // Reset and close form
      event.target.reset();
      this.fileUploadPanelOpened = false;
    }
  }

  openContextMenu(event: any, id: number) {
    event.preventDefault();

    this.contextMenuId = id;

    if (!this.contextMenu) {
      return;
    }

    this.contextMenu.nativeElement.classList.remove("scale-0");
    this.contextMenu.nativeElement.style.transform = `translate(${event.x}px, ${event.y}px)`;

  }

  closeContextMenu() {
    if (!this.contextMenu) {
      return;
    }

    this.contextMenuId = 0;

    this.contextMenu.nativeElement.classList.add("scale-0");
    this.contextMenu.nativeElement.style.transform = null;
  }

  isClickedInsideElement(event: any, idName: string) {
    let el = event.target || event.src;


    if (el.id == idName) {
      return true;
    }
    while (el = el.parentNode) {
      if (el && el.id == idName) {
        return true;
      }
    }

    return false;
  }

  getImgDetails(event: any, file: FileModel) {
    const img = event.target;

    if (file.additional_data == null) {
      file.additional_data = [
        {name: 'Resolution', value: `${img.naturalWidth}x${img.naturalHeight}`}
      ]
    } else {
      file.additional_data.push(
        {name: 'Resolution', value: `${img.naturalWidth}x${img.naturalHeight}`}
      )
    }
  }

}


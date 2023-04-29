import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {DataService} from "../../services/data.service";
import {Directory, DirectoryBuilder} from "../../models/directory.model";
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Subject} from "rxjs";
import {FileBuilder, FileModel} from "../../models/file.model";
import {ModalConfig, ModalOutput} from "../../interfaces";
import {decodeJWT} from "../../utils";

let deleteModalConfig: ModalConfig = {
  subjectName: 'deleteFile',
  title: 'Delete file',
  fields: [
    {
      type: 'text',
      value: 'Do you want to move file to trash?'
    },
    {
      type: 'button',
      value: 'Delete',
      additionalData: {"color": "red-600", "hover": "red-700"}
    }
  ]
}

let permanentlyDeleteModalConfig: ModalConfig = {
  subjectName: 'permanentlyDeleteFile',
  title: 'Permanently delete file',
  fields: [
    {
      type: 'text',
      value: 'Do you want to permanently delete the file?'
    },
    {
      type: 'button',
      value: 'Delete',
      additionalData: {"color": "red-600", "hover": "red-700"}
    }
  ]
}

let restoreFileModalConfig: ModalConfig = {
  subjectName: 'restoreFile',
  title: 'Restore file',
  fields: [
    {
      type: 'text',
      value: 'Do you want to restore the file?'
    },
    {
      type: 'button',
      value: 'Restore',
      additionalData: {"color": "green-400", "hover": "green-500"}
    }
  ]
}

let renameFileModalConfig: ModalConfig = {
  subjectName: 'renameFile',
  title: 'Rename file',
  fields: [
    {
      type: 'text',
      value: 'Do you want to rename the file?'
    },
    {
      type: 'input-text',
      value: '',
      name: 'name'
    },
    {
      type: 'button',
      value: 'Rename',
      additionalData: {"color": "green-400", "hover": "green-500"}
    }
  ]
}


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

  // Used in input to create a new directory
  newDirectoryName = new FormControl('');
  // Toggle for new folder modal
  // TODO: replace with new app-modal component
  modalToggle = new FormControl('');
  // Current directory object and ID
  directory: Directory = new DirectoryBuilder().build();
  directoryId: string = '';
  fileUploadPanelOpened = false;
  isTrash = true;


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
        let trashId = decodeJWT(localStorage.getItem("trashAccessKey") || "")["id"];
        this.isTrash = trashId == this.directoryId;
      }
    )

    // Subject for receiving data from modal. See app-modal for more informations
    this.outputModalSubject.subscribe((data: ModalOutput) => {
      let file = null;
      switch (data.subjectName) {
        case 'permanentlyDeleteFile':
          this.permanentlyDeleteFile(this.directory.files.filter(x => x.id == data.value)[0]);
          break;
        case 'deleteFile':
          file = this.directory.files.find(x => x.id == data.value);
          if (file)
            this.deleteFile(file);

          break;

        case 'restoreFile':
          file = this.directory.files.find(x => x.id == data.value);
          if (file)
            this.restoreFile(file);

          break;
        case 'renameFile':
          if (data.formValues) {
            file = this.directory.files.find(x => x.id == data.value);
            if (file) {
              file = new FileBuilder().setAccessKey(file.access_key).setId(file.id).setName(data.formValues['name']).build();
              this.updateFile(file);
            }

          }

          break;

        default:
          console.log(data);
          break;
      }
    })


  }

  // Subjects for opening file carousel and file details
  fileCarouselSubject: Subject<any> = new Subject();
  fileDetailsSubject: Subject<any> = new Subject();
  openFileCarousel(counter: number) {
    this.fileCarouselSubject.next(counter);
  }

  openFileDetails(i: number) {
    this.fileDetailsSubject.next(i);
  }

  // Modal functions
  inputModalSubject: Subject<any> = new Subject();
  outputModalSubject: Subject<any> = new Subject();

  openModal(config: ModalConfig) {
    console.log(config)
    this.inputModalSubject.next(config);
  }

  openPermanentlyDeleteModal(id: string) {
    permanentlyDeleteModalConfig.data = id;
    this.openModal(permanentlyDeleteModalConfig);
  }

  openDeleteModal(id: string | number) {
    deleteModalConfig.data = id;
    this.openModal(deleteModalConfig);
  }

  openRestoreFileModal(id: string) {
    restoreFileModalConfig.data = id;
    this.openModal(restoreFileModalConfig);
  }

  openRenameFileModal(id: string) {
    renameFileModalConfig.data = id;
    renameFileModalConfig.fields[1].value = this.directory.files.find(x => x.id == id)?.name || '';
    this.openModal(renameFileModalConfig);
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
            this.data.getFile(file).subscribe({
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
    let newDir = new DirectoryBuilder().setName(this.newDirectoryName.value || '').setParentDirectory(this.directory.id);

    if (this.newDirectoryName.value) {
      this.data.createDirectory(newDir, this.directory.access_key).subscribe({
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

  // openContextMenu function opens context menu and sets contextMenuId value to INDEX of file in file list
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

  permanentlyDeleteFile(file: FileModel) {
    return this.data.deleteFile(file).subscribe({
      next: (data) => {
        if (data.status === 204) {
          this.directory.files = this.directory.files.filter(x => x != file);
        }
      }
    })
  }

  deleteFile(file: FileModel) {
    const trashAccessKey = localStorage.getItem("trashAccessKey");
    if (!trashAccessKey)
      return


    file.previous_parent_directory = file.parent_directory;
    file.parent_directory = decodeJWT(trashAccessKey)["id"];

    this.updateFile(file, trashAccessKey);
  }

  restoreFile(file: FileModel) {
    file.parent_directory = file.previous_parent_directory;
    file.previous_parent_directory = "";

    this.updateFile(file);
  }

  updateFile(file: FileModel, directoryAccessKey?: string) {
    return this.data.updateFile(file, directoryAccessKey).subscribe({
      next: (data) => {
        if (data.status === 204) {
          // Check if parent_directory is changed (file moved).
          // If it is, file must be removed from current directory
          if (file.parent_directory != "" && file.parent_directory != this.directoryId) {
            this.directory.files = this.directory.files.filter(x => x.id != file.id);
          }

          // Check if file name was changed and update it in template
          let changedDirectory = this.directory.files.find(x => x.id == file.id);
          if (changedDirectory && changedDirectory.name != file.name) {
            changedDirectory.name = file.name;
          }
        }
      }
    })
  }
  // Event when user uses keyboard key on file
  onFileKeydown(event: KeyboardEvent, index: number) {
    if (event.key === "F1") {
      this.openFileDetails(index);
    } else if (event.key === "F2") {
      this.openRenameFileModal(this.directory.files[index].id);
    } else if (event.key === "F4") {
      this.openDeleteModal(this.directory.files[index].id);
    }
  }
}


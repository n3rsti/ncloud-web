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
import {ConstNames} from "../../constants";

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

let renameDirectoryModalConfig: ModalConfig = Object.create(renameFileModalConfig)
renameDirectoryModalConfig.subjectName = 'renameDirectory';
renameDirectoryModalConfig.title = 'Rename Directory'
renameDirectoryModalConfig.fields[0].value = 'Do you want to rename the directory?';


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
  contextMenuConstants = ConstNames

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
  contextMenuType = "";
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
        case 'renameDirectory':
          if (!data.formValues) {
            return
          }
          let dir = this.directory.directories.find(x => x.id == data.value);

          if (!dir) {
            return;
          }

          const dirToUpdate = new DirectoryBuilder()
            .setAccessKey(dir.access_key)
            .setName(data.formValues['name'])
            .setId(dir.id)
            .build();
          this.updateDirectory(dirToUpdate);

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

  openFileDetails(i: number, type: string) {
    let title = '';
    if (type === ConstNames.FILE) {
      title = 'File details';
    } else if (type === ConstNames.DIRECTORY) {
      title = 'Directory details'
    }
    this.fileDetailsSubject.next({
      index: i,
      type: type,
      title: title
    });
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

  openRenameDirectoryModal(id: number) {
    renameDirectoryModalConfig.data = this.directory.directories[id].id;
    renameDirectoryModalConfig.fields[1].value = this.directory.directories[id].name;
    this.openModal(renameDirectoryModalConfig);
  }

  openRenameFileModal(id: number) {
    renameFileModalConfig.data = this.directory.files[id].id;
    renameFileModalConfig.fields[1].value = this.directory.files[id].name;
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

  // openContextMenu function opens context menu and sets contextMenuId value to INDEX of file in file list
  openContextMenu(event: any, id: number, type: string) {
    console.log(id, type)
    event.preventDefault();

    this.contextMenuId = id;
    this.contextMenuType = type;


    if (!this.contextMenu) {
      return;
    }

    this.contextMenu.nativeElement.classList.remove("scale-0");
    this.contextMenu.nativeElement.style.transform = `translate(${event.pageX}px, ${event.pageY}px)`;

    console.log(event.x, event.y)
    console.log(event)

  }

  closeContextMenu() {
    if (!this.contextMenu) {
      return;
    }

    this.contextMenuId = 0;

    this.contextMenu.nativeElement.classList.add("scale-0");
    this.contextMenu.nativeElement.style.transform = null;
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
          let changedFile = this.directory.files.find(x => x.id == file.id);
          if (changedFile && changedFile.name != file.name) {
            changedFile.name = file.name;
          }
        }
      }
    })
  }

  updateDirectory(directory: Directory) {
    return this.data.updateDirectory(directory).subscribe({
      next: (data) => {
        if (data.status === 204) {
          let directoryBeforeUpdate = this.directory.directories.find(x => x.id === directory.id);
          if (directoryBeforeUpdate && directoryBeforeUpdate.name !== directory.name) {
            directoryBeforeUpdate.name = directory.name;
          }
        }
      }
    })
  }

  // Event when user uses keyboard key on file
  onFileKeydown(event: KeyboardEvent, index: number, type: string) {
    // File hotkeys
    if (event.key === "F1" && type === ConstNames.FILE) {
      this.openFileDetails(index, type);
    } else if (event.key === "F2" && type === ConstNames.FILE) {
      this.openRenameFileModal(index);
    } else if (event.key === "F4" && type === ConstNames.FILE) {
      this.openDeleteModal(this.directory.files[index].id);
    }
    // Directory hotkeys
    else if (event.key === "F1" && type === ConstNames.DIRECTORY) {
      this.openFileDetails(index, type);
    }
    else if (event.key === "F2" && type === ConstNames.DIRECTORY) {
      this.openRenameDirectoryModal(index);
    }
  }
}


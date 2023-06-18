import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from "../../services/data.service";
import { Directory, DirectoryBuilder } from "../../models/directory.model";
import { DomSanitizer } from "@angular/platform-browser";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { FileBuilder, FileModel } from "../../models/file.model";
import { ModalConfig, ModalOutput } from "../../interfaces";
import { decodeJWT, FileFormats } from "../../utils";
import { ConstNames } from "../../constants";

let deleteModalConfig: ModalConfig = {
  subjectName: 'deleteItems',
  title: 'Delete file',
  fields: [
    {
      type: 'text',
      value: 'Do you want to move x items to trash?'
    },
    {
      type: 'button',
      value: 'Delete',
      additionalData: { "color": "red-600", "hover": "red-700" }
    }
  ]
}

let permanentlyDeleteModalConfig: ModalConfig = {
  subjectName: 'permanentlyDeleteItems',
  title: 'Permanently delete items',
  fields: [
    {
      type: 'text',
      value: 'Do you want to permanently delete x items?'
    },
    {
      type: 'button',
      value: 'Delete',
      additionalData: { "color": "red-600", "hover": "red-700" }
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
      additionalData: { "color": "green-400", "hover": "green-500" }
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
      additionalData: { "color": "green-400", "hover": "green-500" }
    }
  ]
}

let renameDirectoryModalConfig: ModalConfig = Object.create(renameFileModalConfig)
renameDirectoryModalConfig.subjectName = 'renameDirectory';
renameDirectoryModalConfig.title = 'Rename Directory'
renameDirectoryModalConfig.fields[0].value = 'Do you want to rename the directory?';

let createDirectoryModalConfig: ModalConfig = {
  subjectName: 'createDirectory',
  title: 'New folder',
  fields: [
    {
      type: 'input-text',
      value: '',
      name: 'name',
      additionalData: { "placeholder": "Example folder name..." }
    },
    {
      type: 'button',
      value: 'Create new folder',
      additionalData: { "color": "indigo-700", "hover": "indigo-800" }
    }
  ]
}


let restoreDirectoryModalConfig: ModalConfig = {
  subjectName: 'restoreDirectory',
  title: 'Restore directory',
  fields: [
    {
      type: 'text',
      value: 'Do you want to restore this directory?'
    },
    {
      type: 'button',
      value: 'Restore',
      additionalData: { "color": "green-400", "hover": "green-500" }
    }
  ]
}


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  contextMenuConstants = ConstNames
  modalToggle = new FormControl('');
  // Current directory object and ID
  directory: Directory = new DirectoryBuilder().build();
  directoryId: string = '';
  isTrash = true;

  contextMenuId = 0;
  contextMenuType = "";
  @ViewChild('contextMenu', { static: false }) contextMenu: ElementRef | undefined;

  dragElementId = "";
  dragElementType = "";

  isLoaded = false;
  selectedFiles: FileModel[] = [];
  selectedDirectories: Directory[] = [];

  lastSelectedElement: string = this.contextMenuConstants.DIRECTORY;

  keyboardEvent = (e: KeyboardEvent) => {
    this.handleKeyDown(e);
  }

  clickEvent = (e: MouseEvent) => {
    if (e.button === 0) {
      this.closeContextMenu();
    }
    let target = e.target as HTMLElement;
    while (target.parentElement) {
      if (target.classList.contains("utility:keep-selected")) {
        return;
      }
      target = target.parentElement;
    }
    this.selectedFiles = [];
    this.selectedDirectories = [];
    this.lastSelectedElement = this.contextMenuConstants.DIRECTORY;
  }

  constructor(private data: DataService, public sanitizer: DomSanitizer, private route: ActivatedRoute, public router: Router) {
  }

  ngOnDestroy(){
    // Very important. Don't remove
    document.body.removeEventListener("keydown", this.keyboardEvent);
    document.body.removeEventListener("click", this.clickEvent);
  }
  ngOnInit() {
    document.body.addEventListener("click", this.clickEvent);
    document.body.addEventListener("keydown", this.keyboardEvent)

    this.route.params.subscribe(params => {
      if (params["id"]) {
        this.directoryId = params["id"];
        this.getDirectory();
      }
      else if (localStorage.getItem("mainDirectoryId")) {
        this.directoryId = localStorage.getItem("mainDirectoryId") || "";
        this.router.navigate(['/' + this.directoryId]);
      }
      else {
        this.getDirectory();
      }


      let trashId = decodeJWT(localStorage.getItem("trashAccessKey") || "")["id"];
      this.isTrash = trashId == this.directoryId;
    }
    )

    // Subject for receiving data from modal. See app-modal for more information
    this.outputModalSubject.subscribe((data: ModalOutput) => {
      let file = null;
      let directory = null;
      switch (data.subjectName) {
        case 'permanentlyDeleteItems':
          // Argument must be passed as value because otherwise it will be overwritten while doing delete request
          if (this.selectedDirectories.length > 0) {
            this.permanentlyDeleteDirectories([...this.selectedDirectories]);
          }
          if (this.selectedFiles.length > 0) {
            this.permanentlyDeleteFiles([...this.selectedFiles]);
          }

          break;
        case 'deleteItems':
          // Argument must be passed as value because otherwise it will be overwritten while doing move request
          if (this.selectedDirectories.length > 0) {
            this.deleteDirectories([...this.selectedDirectories]);
          }
          if (this.selectedFiles.length > 0) {
            this.deleteFiles([...this.selectedFiles]);
          }

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
          directory = this.directory.directories.find(x => x.id == data.value);

          if (!directory) {
            return;
          }

          const dirToUpdate = new DirectoryBuilder()
            .setAccessKey(directory.access_key)
            .setName(data.formValues['name'])
            .setId(directory.id)
            .build();
          this.updateDirectory(dirToUpdate);

          break;
        case 'createDirectory':
          let newFolderName = data.formValues?.["name"];
          if (newFolderName) {
            this.createDirectory(newFolderName);
          }
          break;

        case 'restoreDirectory':
          directory = this.directory.directories.find(x => x.id == data.value);
          if (directory) {
            this.restoreDirectory(directory);
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
    this.inputModalSubject.next(config);
  }

  openPermanentlyDeleteModal() {
    if (this.selectedFiles.length + this.selectedDirectories.length > 1) {
      permanentlyDeleteModalConfig.fields[0].value = `Do you want to permanently delete these ${this.selectedFiles.length + this.selectedDirectories.length} items?`
    }
    else {
      permanentlyDeleteModalConfig.fields[0].value = 'Do you want to permanently delete this item?'
    }

    this.openModal(permanentlyDeleteModalConfig);
  }

  openDeleteModal() {
    if (this.selectedFiles.length + this.selectedDirectories.length > 1) {
      deleteModalConfig.fields[0].value = `Do you want to move these ${this.selectedDirectories.length + this.selectedFiles.length} items to trash?`;
    }
    else {
      deleteModalConfig.fields[0].value = `Do you want to move this item to trash?`;
    }

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

  openCreateDirectoryModal() {
    this.openModal(createDirectoryModalConfig);
  }

  openRestoreDirectoryModal(id: string) {
    restoreDirectoryModalConfig.data = id;
    this.openModal(restoreDirectoryModalConfig);
  }

  getDirectory() {

    this.data.getDirectory(this.directoryId).subscribe({
      next: (data: Directory[]) => {
        this.directory = data[0];
        if (this.directoryId == "") {
          localStorage.setItem("mainDirectoryId", this.directory.id);
          this.router.navigate(['/' + this.directory.id]);
        }

        this.directory.files.forEach(file => {
          if (FileFormats.FILES_TO_DISPLAY.includes(file.type)) {
            this.data.getFile(file).subscribe({
              next: (data) => {
                // Convert blob to URL
                const urlCreator = window.URL || window.webkitURL;
                file.src = this.sanitizer.bypassSecurityTrustUrl(urlCreator.createObjectURL(data));
              },
            })
          }
        })
        this.isLoaded = true;
      },
    })
  }

  createDirectory(name: string) {
    let newDir = new DirectoryBuilder().setName(name).setParentDirectory(this.directory.id);
    if (name) {
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
    event.preventDefault();

    this.contextMenuId = id;
    this.contextMenuType = type;


    if (!this.contextMenu) {
      return;
    }

    this.contextMenu.nativeElement.classList.remove("scale-0");
    this.contextMenu.nativeElement.style.transform = `translate(${event.pageX}px, ${event.pageY}px)`;
  }

  closeContextMenu() {
    if (!this.contextMenu) {
      return;
    }

    this.contextMenuId = 0;

    this.contextMenu.nativeElement.classList.add("scale-0");
    this.contextMenu.nativeElement.style.transform = null;
  }
  

  deleteFiles(files: FileModel[]) {
    const trashAccessKey = localStorage.getItem("trashAccessKey");
    if (!trashAccessKey)
      return


    let destinationDirectory = new DirectoryBuilder()
      .setId(decodeJWT(trashAccessKey)["id"])
      .setAccessKey(trashAccessKey)
      .build();

    let directoriesWithFiles = [
      new DirectoryBuilder()
        .setId(this.directory.id)
        .setAccessKey(this.directory.access_key)
        .setFiles(files)
        .build()
    ]

    this.data.moveFiles(directoriesWithFiles, destinationDirectory).subscribe({
      next: (data) => {
        if (data.status === 200) {
          this.directory.files = this.directory.files.filter(x => !files.includes(x));
        }
      }
    });
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

  restoreDirectory(directory: Directory) {
    directory.parent_directory = directory.previous_parent_directory;
    directory.previous_parent_directory = "";

    this.updateDirectory(directory);
  }

  deleteDirectories(directories: Directory[]) {
    const trashAccessKey = localStorage.getItem("trashAccessKey");
    if (!trashAccessKey)
      return


    let destinationDirectory = new DirectoryBuilder()
      .setId(decodeJWT(trashAccessKey)["id"])
      .setAccessKey(trashAccessKey)
      .build();


    this.moveDirectories(directories, destinationDirectory);
  }

  moveDirectories(directories: Directory[], destinationDirectory: Directory){
    this.data.moveDirectories(directories, destinationDirectory).subscribe({
      next: (data) => {
        let filesAdded = false;
        if (data.status === 200) {
          directories.forEach(element => {
            if(!this.directory.directories.map(x => x.id).includes(element.id)){
              this.directory.directories = [...this.directory.directories, element];
              filesAdded = true;
            }
          })

          if(!filesAdded){
            this.directory.directories = this.directory.directories.filter(x => !directories.includes(x))
          }
        }
      }
    })
  }

  updateDirectory(directory: Directory, newDirectoryAccessKey?: string) {
    return this.data.updateDirectory(directory, newDirectoryAccessKey).subscribe({
      next: (data) => {
        if (data.status === 204) {
          let directoryBeforeUpdate = this.directory.directories.find(x => x.id === directory.id);
          if (directoryBeforeUpdate && directoryBeforeUpdate.name !== directory.name) {
            directoryBeforeUpdate.name = directory.name;
          }
          if (directory.parent_directory != "" && directory.parent_directory != this.directoryId) {
            this.directory.directories = this.directory.directories.filter(x => x.id != directory.id);
          }
        }
      }
    })
  }

  // Event when user uses keyboard key on file
  onFileKeydown(event: KeyboardEvent, index: number, type: string) {
    // File hotkeys
    if (type === ConstNames.FILE) {
      switch (event.key) {
        case "F1":
          this.openFileDetails(index, type);
          break;
        case "F2":
          this.openRenameFileModal(index);
          break;
        case "F4":
          this.openDeleteModal();
          break;
        case "Delete":
          this.openDeleteModal();
          break;
      }
    }
    // Directory hotkeys
    else if (type === ConstNames.DIRECTORY) {
      switch (event.key) {
        case "F1":
          this.openFileDetails(index, type);
          break;
        case "F2":
          this.openRenameDirectoryModal(index);
          break;
        case "F4":
          this.openDeleteModal();
          break;
        case "Delete":
          this.openDeleteModal();
          break;
      }
    }

  }

  downloadFile(file: FileModel) {
    this.data.getFile(file).subscribe({
      next: (data) => {
        // Convert blob to URL
        const urlCreator = window.URL || window.webkitURL;

        let link = document.createElement("a");
        link.href = urlCreator.createObjectURL(data);
        link.download = file.name;
        link.click();
        link.remove();
      },
    })
  }

  moveToDirectory(directoryId: string) {
    if (this.dragElementType === this.contextMenuConstants.FILE) {
      let file = this.directory.files.find(x => x.id === this.dragElementId);
      if (file) {
        file.parent_directory = directoryId;
        this.updateFile(file);
      }
    }
    else if (this.dragElementType === this.contextMenuConstants.DIRECTORY) {
      let directory = this.directory.directories.find(x => x.id === this.dragElementId);
      if (directory) {
        directory.parent_directory = directoryId;
        this.updateDirectory(directory);
      }
    }
  }

  addSelectedDirectory(event: MouseEvent, directory: Directory) {
    if (event.shiftKey) {
      if (this.lastSelectedElement === this.contextMenuConstants.DIRECTORY) {
        let lastSelectedElement = this.selectedDirectories.at(-1);
        let lastSelectedElementIndex = 0;

        let selectedElementIndex = 0;
        this.directory.directories.forEach((element, index) => {
          if (element === directory) {
            selectedElementIndex = index;
          }
          else if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        })

        let [startIndex, endIndex] = [lastSelectedElementIndex, selectedElementIndex].sort();

        this.selectedDirectories = this.directory.directories.slice(startIndex, endIndex + 1);

      }
      else if (this.lastSelectedElement === this.contextMenuConstants.FILE) {
        let lastSelectedElement = this.selectedFiles.at(-1) || new FileBuilder().build();
        let lastSelectedElementIndex = 0;

        this.directory.files.forEach((element, index) => {
          if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        })

        let selectedElementIndex = 0;
        this.directory.directories.forEach((element, index) => {
          if (element === directory) {
            selectedElementIndex = index;
          }
        })


        this.selectedDirectories = this.directory.directories.slice(selectedElementIndex);
        this.selectedFiles = this.directory.files.slice(0, lastSelectedElementIndex + 1);

      }
    }
    else if (event.ctrlKey) {
      if (!this.selectedDirectories.includes(directory)) {
        this.selectedDirectories.push(directory);
      }
    }
    else if (event.button === 2) {
      if (!this.selectedDirectories.includes(directory)) {
        this.selectedDirectories = [directory];
        this.selectedFiles = [];
      }

      this.lastSelectedElement = this.contextMenuConstants.DIRECTORY;
      return;
    }
    else {
      this.selectedDirectories = [directory];
      this.selectedFiles = [];
    }
    this.lastSelectedElement = this.contextMenuConstants.DIRECTORY;
  }

  addSelectedFile(event: MouseEvent, file: FileModel) {
    if (event.shiftKey) {
      if (this.lastSelectedElement === this.contextMenuConstants.FILE) {
        let lastSelectedElement = this.selectedFiles.at(-1);
        let lastSelectedElementIndex = 0;

        let selectedElementIndex = 0;
        this.directory.files.forEach((element, index) => {
          if (element === file) {
            selectedElementIndex = index;
          }
          else if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        })

        let [startIndex, endIndex] = [lastSelectedElementIndex, selectedElementIndex].sort();

        this.selectedFiles = this.directory.files.slice(startIndex, endIndex + 1);

      }
      else if (this.lastSelectedElement === this.contextMenuConstants.DIRECTORY) {
        let lastSelectedElement = this.selectedDirectories.at(-1);
        let lastSelectedElementIndex = 0;

        this.directory.directories.forEach((element, index) => {
          if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        })

        let selectedElementIndex = 0;
        this.directory.files.forEach((element, index) => {
          if (element === file) {
            selectedElementIndex = index;
          }
        })

        this.selectedDirectories = this.directory.directories.slice(lastSelectedElementIndex);
        this.selectedFiles = this.directory.files.slice(0, selectedElementIndex + 1);

      }
    }
    else if (event.ctrlKey) {
      if (!this.selectedFiles.includes(file)) {
        this.selectedFiles.push(file);
      }
    }
    else if (event.button === 2) {
      if (!this.selectedFiles.includes(file)) {
        this.selectedFiles = [file];
        this.selectedDirectories = [];
      }
      this.lastSelectedElement = this.contextMenuConstants.FILE;
      return;
    }
    else {
      this.selectedFiles = [file];
      this.selectedDirectories = [];
    }
    this.lastSelectedElement = this.contextMenuConstants.FILE;
  }

  permanentlyDeleteFiles(files: FileModel[]) {
    let body = [{
      "id": this.directory.id,
      "access_key": this.directory.access_key,
      "files": files.map(x => x.id)
    }]

    this.data.permanentlyDeleteMultipleFiles(body).subscribe({
      next: (data) => {
        if (data.status === 200) {
          this.directory.files = this.directory.files.filter(x => !files.includes(x));
        }
      }
    })
  }

  permanentlyDeleteDirectories(directories: Directory[]) {
    let body = directories.map(x => ({ "id": x.id, "access_key": x.access_key }));
    this.data.deleteDirectories(body).subscribe({
      next: (data) => {
        if (data.status === 204) {
          this.directory.directories = this.directory.directories.filter(x => !directories.includes(x));
        }
      }
    })
  }

  handleKeyDown(event: KeyboardEvent){
    if(event.key === "x" && event.ctrlKey){
      localStorage.removeItem("cutFiles");
      localStorage.removeItem("cutDirectories");

      if(this.selectedFiles.length > 0){
        localStorage.setItem("cutFiles", JSON.stringify(this.selectedFiles));
      }
      if(this.selectedDirectories.length > 0){
        localStorage.setItem("cutDirectories", JSON.stringify(this.selectedDirectories));
      }
    }
    else if(event.key === "v" && event.ctrlKey){
      let cutDirectories = localStorage.getItem("cutDirectories");
      let cutFiles = localStorage.getItem("cutFiles");

      if(cutDirectories) {
        let parsedDirectories = JSON.parse(cutDirectories).map((element: any) => {
          return new DirectoryBuilder()
            .setId(element._id)
            .setAccessKey(element._access_key)
            .setName(element._name)
            .setParentDirectory(element._parent_directory)
            .build()
        });
        this.moveDirectories(parsedDirectories, this.directory);

        localStorage.removeItem("cutFiles");
        localStorage.removeItem("cutDirectories");
      }
    }
  }
}

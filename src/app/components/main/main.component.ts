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
      additionalData: { "color": "red-600", "hover": "red-700" }
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

let permanentlyDeleteDirectoryModalConfig: ModalConfig = {
  subjectName: 'permanentlyDeleteDirectory',
  title: 'Permanently delete directory',
  fields: [
    {
      type: 'text',
      value: 'Do you want to permanently delete the folder?'
    },
    {
      type: 'button',
      value: 'Delete',
      additionalData: { "color": "red-600", "hover": "red-700" }
    }
  ]
}

let deleteDirectoryModalConfig: ModalConfig = {
  subjectName: 'deleteDirectory',
  title: 'Delete directory',
  fields: [
    {
      type: 'text',
      value: 'Do you want to move directory to trash?'
    },
    {
      type: 'button',
      value: 'Delete',
      additionalData: { "color": "red-600", "hover": "red-700" }
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
  selectedFiles: Set<string> = new Set();
  selectedDirectories: Set<string> = new Set();
  lastSelectedElement: string = this.contextMenuConstants.DIRECTORY;


  constructor(private data: DataService, public sanitizer: DomSanitizer, private route: ActivatedRoute, public router: Router) {
  }

  ngOnInit() {
    document.addEventListener("click", (e) => {
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
      this.selectedFiles.clear();
      this.selectedDirectories.clear();
      this.lastSelectedElement = this.contextMenuConstants.DIRECTORY;


    })
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
        case 'permanentlyDeleteFile':
          // Argument must be passed as value because otherwise it will be overwritten while doing delete request
          this.permanentlyDeleteMultipleFiles(new Set(this.selectedFiles))

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

        case 'permanentlyDeleteDirectory':
          directory = this.directory.directories.find(x => x.id == data.value);
          if (directory) {
            this.permanentlyDeleteDirectory(directory);
          }

          break;
        case 'deleteDirectory':
          directory = this.directory.directories.find(x => x.id == data.value);
          if (directory) {
            this.deleteDirectory(directory);
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
    if (this.selectedFiles.size > 1) {
      permanentlyDeleteModalConfig.fields[0].value = `Do you want to permanently delete ${this.selectedFiles.size} files?`
    }
    else {
      permanentlyDeleteModalConfig.fields[0].value = 'Do you want to permanently delete the file?'
    }

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

  openCreateDirectoryModal() {
    this.openModal(createDirectoryModalConfig);
  }

  openPermanentlyDeleteDirectoryModal(id: string) {
    permanentlyDeleteDirectoryModalConfig.data = id;
    this.openModal(permanentlyDeleteDirectoryModalConfig);
  }

  openDeleteDirectoryModal(id: string) {
    deleteDirectoryModalConfig.data = id;
    this.openModal(deleteDirectoryModalConfig);
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

  restoreDirectory(directory: Directory) {
    directory.parent_directory = directory.previous_parent_directory;
    directory.previous_parent_directory = "";

    this.updateDirectory(directory);
  }

  deleteDirectory(directory: Directory) {
    const trashAccessKey = localStorage.getItem("trashAccessKey");
    if (!trashAccessKey)
      return


    directory.previous_parent_directory = directory.parent_directory;
    directory.parent_directory = decodeJWT(trashAccessKey)["id"];

    this.updateDirectory(directory, trashAccessKey);
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

  permanentlyDeleteDirectory(directory: Directory) {
    return this.data.deleteDirectory(directory).subscribe({
      next: (data) => {
        if (data.status === 204) {
          this.directory.directories = this.directory.directories.filter(x => x.id != directory.id);
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
          this.openDeleteModal(this.directory.files[index].id);
          break;
        case "Delete":
          this.openDeleteModal(this.directory.files[index].id);
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

  handleFileSelection(event: MouseEvent, id: string) {
    // CTRL key: Add file to selected with ctrl key if it's not already selected
    if (event.ctrlKey && !this.selectedFiles.has(id)) {
      this.selectedFiles.add(id);
    }
    // CTRL key: Remove file from selected with ctrl key if it's already selected
    else if (event.ctrlKey && this.selectedFiles.has(id)) {
      this.selectedFiles.delete(id);
    }
    // Right click without CTRL: Don't unselect other files
    else if (event.button === 2 && this.selectedFiles.has(id)) {
      return
    }
    // Left click without CTRL: Unselect all files and select only clicked
    else if (!event.ctrlKey) {
      this.selectedDirectories.clear();
      this.selectedFiles.clear();
      this.selectedFiles.add(id);
    }
  }

  handleDirectorySelection(event: MouseEvent, id: string) {

    // CTRL key: Add directory to selected with ctrl key if it's not already selected
    if (event.ctrlKey && !this.selectedDirectories.has(id)) {
      this.selectedDirectories.add(id);
    }
    // CTRL key: Remove directory from selected with ctrl key if it's already selected
    else if (event.ctrlKey && this.selectedDirectories.has(id)) {
      this.selectedDirectories.delete(id);
    }
    // Right click without CTRL: Don't unselect other files
    else if (event.button === 2 && this.selectedDirectories.has(id)) {
      return
    }
    // Left click without CTRL: Unselect all files and select only clicked
    else if (!event.ctrlKey) {
      this.selectedFiles.clear();
      this.selectedDirectories.clear();
      this.selectedDirectories.add(id);
    }
  }


  /*
  Add to selected all elements between last selected element and now selected element

  The problem with this code is that it has to handle 4 possibilites:
  1. Last selected item was directory, now selected item is file
  2. Last selected item was file, now selected item is directory

  3. Last selected and now selected items are files
  4. Last selected and now selected items are directories

  Technically there are 2 more cases:
  - No selected element before and now selected is file
  - No selected element before and now selected is directory

  Luckily they can be solved by setting this.lastSelectedElement to DIRECTORY and functions from groups 1-4 will solve them

  These 2 groups (1,2 and 3,4) are so similar yet so different in functionality that I couldn't find a solution how to wrap them into 2 functions (1 for each group)

  The positive thing about this function is that it works
  I would really recommend not to touch this thing

  If it works, don't change it

  */
  handleMultipleSelection(id: string, type: string) {
    if (this.lastSelectedElement === this.contextMenuConstants.DIRECTORY && type === this.contextMenuConstants.FILE) {
      let lastSelectedElementId = Array.from(this.selectedDirectories).at(-1);
      let lastSelectedElementIndex = 0;

      // Find index of last selected directory
      this.directory.directories.forEach((directory, index) => {
        if (directory.id === lastSelectedElementId) {
          lastSelectedElementIndex = index;
        }
      })

      // Add to selected all directories after the last selected one
      this.directory.directories.slice(lastSelectedElementIndex).forEach(directory => {
        this.selectedDirectories.add(directory.id);
      })


      let selectedFileIndex = 0;
      // Find index of selected file
      this.directory.files.forEach((file, index) => {
        if (file.id === id) {
          selectedFileIndex = index;
        }
      })

      this.directory.files.slice(0, selectedFileIndex + 1).forEach(file => {
        this.selectedFiles.add(file.id);
      })
    }
    else if (this.lastSelectedElement === this.contextMenuConstants.FILE && type === this.contextMenuConstants.DIRECTORY) {
      let lastSelectedElementId = Array.from(this.selectedFiles).at(-1);
      let lastSelectedElementIndex = 0;

      // Find index of last selected file
      this.directory.files.forEach((file, index) => {
        if (file.id === lastSelectedElementId) {
          lastSelectedElementIndex = index;
        }
      })

      // Add to selected all files before the last selected one
      this.directory.files.slice(0, lastSelectedElementIndex + 1).forEach(file => {
        this.selectedFiles.add(file.id);
      })

      let selectedDirectoryIndex = 0;
      // Find index of selected directory
      this.directory.directories.forEach((directory, index) => {
        if (directory.id === id) {
          selectedDirectoryIndex = index;
        }
      })

      this.directory.directories.slice(selectedDirectoryIndex).forEach(directory => {
        this.selectedDirectories.add(directory.id);
      })

    }
    else if (this.lastSelectedElement === this.contextMenuConstants.FILE && type === this.contextMenuConstants.FILE) {
      // Find last selected file
      let lastSelectedElementId = Array.from(this.selectedFiles).at(-1);


      // Find position of last selected and now selected files in order to find files in between
      let lastSelectedElementIndex = 0;
      let selectedItemIndex = 0;
      this.directory.files.forEach((directory, index) => {
        if (directory.id === lastSelectedElementId) {
          lastSelectedElementIndex = index;
        }
        else if (directory.id === id) {
          selectedItemIndex = index;
        }
      })



      let [startIndex, endIndex] = [lastSelectedElementIndex, selectedItemIndex].sort();
      this.directory.files.slice(startIndex, endIndex + 1).forEach(element => {
        this.selectedFiles.add(element.id);
      })

    }
    else if (this.lastSelectedElement === this.contextMenuConstants.DIRECTORY && type === this.contextMenuConstants.DIRECTORY) {
      // Find last selected directory
      let lastSelectedElementId = Array.from(this.selectedDirectories).at(-1);


      // Find position of last selected and now selected files in order to find files in between
      let lastSelectedElementIndex = 0;
      let selectedItemIndex = 0;
      this.directory.directories.forEach((directory, index) => {
        if (directory.id === lastSelectedElementId) {
          lastSelectedElementIndex = index;
        }
        else if (directory.id === id) {
          selectedItemIndex = index;
        }
      })



      let [startIndex, endIndex] = [lastSelectedElementIndex, selectedItemIndex].sort();
      this.directory.directories.slice(startIndex, endIndex + 1).forEach(element => {
        this.selectedDirectories.add(element.id);
      })
    }
  }


  addSelected(event: MouseEvent, id: string, type: string) {
    if (this.lastSelectedElement === '') {
      this.lastSelectedElement = type;
    }
    if (event.shiftKey) {
      this.handleMultipleSelection(id, type);

    }
    else if (type === this.contextMenuConstants.FILE) {
      this.handleFileSelection(event, id);
    }
    else if (type === this.contextMenuConstants.DIRECTORY) {
      this.handleDirectorySelection(event, id);
    }

    this.lastSelectedElement = type;
  }

  permanentlyDeleteMultipleFiles(files: Set<String>) {
    this.data.permanentlyDeleteMultipleFiles(this.directory.id, files, this.directory.access_key).subscribe({
      next: (data) => {
        if (data.status === 200) {
          this.directory.files = this.directory.files.filter(x => !files.has(x.id));
        }
      }
    })
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Directory, DirectoryBuilder } from '../../models/directory.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { FileBuilder, FileModel } from '../../models/file.model';
import { ModalConfig, ModalOutput } from '../../interfaces';
import { decodeJWT, FileFormats } from '../../utils';
import { ConstNames } from '../../constants';
import {
  createDirectoryModalConfig,
  deleteModalConfig,
  permanentlyDeleteModalConfig,
  renameDirectoryModalConfig,
  renameFileModalConfig,
  restoreModalConfig,
} from '../modal/modal.config';
import { ToastService } from 'src/app/services/toast.service';
import { ModalService } from 'src/app/services/modal.service';

const RIGHT_CLICK = 2;
const LEFT_CLICK = 0;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  constElementNames = ConstNames;

  directory: Directory = new DirectoryBuilder().build();
  directoryId: string = '';
  isTrash = true;

  fileUploadOpened = false;

  contextMenuElementIndex = 0;
  contextMenuElementType = '';
  @ViewChild('contextMenu', { static: false }) contextMenu:
    | ElementRef
    | undefined;

  selectedFiles: FileModel[] = [];
  selectedDirectories: Directory[] = [];

  lastSelectedElement: string = this.constElementNames.DIRECTORY;

  filesToDisplay = FileFormats.FILES_TO_DISPLAY;
  // These functions are used in event listeners
  // They are here so they can get removed from event listener on ngOnDestroy
  keyboardEvent = (e: KeyboardEvent) => {
    this.handleKeyDown(e);
  };

  clickEvent = (e: MouseEvent) => {
    if (e.button === LEFT_CLICK) {
      this.closeContextMenu();
    }
    let target = e.target as HTMLElement;
    while (target.parentElement) {
      if (target.classList.contains('utility:keep-selected')) {
        return;
      }
      target = target.parentElement;
    }
    this.selectedFiles = [];
    this.selectedDirectories = [];
    this.lastSelectedElement = this.constElementNames.DIRECTORY;
  };

  modalServiceSub: Subscription | undefined;

  constructor(
    private data: DataService,
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    public router: Router,
    private toastService: ToastService,
    private modalService: ModalService
  ) { }

  ngOnDestroy() {
    // Very important. Don't remove
    document.body.removeEventListener('keydown', this.keyboardEvent);
    document.body.removeEventListener('click', this.clickEvent);

    this.modalServiceSub?.unsubscribe();
  }
  ngOnInit() {
    document.body.addEventListener('click', this.clickEvent);
    document.body.addEventListener('keydown', this.keyboardEvent);

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.directoryId = params['id'];
        this.getDirectory();
      } else if (!params['id'] && localStorage.getItem('mainDirectoryId')) {
        this.directoryId = localStorage.getItem('mainDirectoryId') || '';
        this.router.navigate(['/' + this.directoryId]);
      } else {
        this.getDirectory();
      }

      const trashId = decodeJWT(localStorage.getItem('trashAccessKey') || '')[
        'id'
      ];
      this.isTrash = trashId == this.directoryId;
    });
    // Subject for receiving data from modal. See app-modal for more information
    this.modalServiceSub = this.modalService.output.subscribe(
      (data: ModalOutput) => {
        let file = null;
        let directory = null;
        switch (data.subjectName) {
          case 'permanentlyDeleteItems':
            if (this.selectedDirectories.length > 0) {
              this.permanentlyDeleteDirectories([...this.selectedDirectories]);
            }
            if (this.selectedFiles.length > 0) {
              this.permanentlyDeleteFiles([...this.selectedFiles]);
            }

            break;
          case 'deleteItems':
            if (this.selectedDirectories.length > 0) {
              this.deleteDirectories([...this.selectedDirectories]);
            }
            if (this.selectedFiles.length > 0) {
              this.deleteFiles([...this.selectedFiles]);
            }

            break;

          case 'restoreItems':
            if (this.selectedFiles.length > 0) {
              this.restoreFiles([...this.selectedFiles]);
            }
            if (this.selectedDirectories.length > 0) {
              this.restoreDirectories([...this.selectedDirectories]);
            }

            break;
          case 'renameFile':
            if (data.formValues) {
              file = this.directory.files.find((x) => x.id == data.value);
              if (file) {
                file = new FileBuilder()
                  .setId(file.id)
                  .setName(data.formValues['name'])
                  .build();
                this.updateFile(file);
              }
            }

            break;
          case 'renameDirectory':
            if (!data.formValues) {
              return;
            }
            directory = this.directory.directories.find(
              (x) => x.id == data.value
            );

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
            let newFolderName = data.formValues?.['name'];
            if (newFolderName) {
              this.createDirectory(newFolderName);
            }
            break;

          default:
            console.log(data);
            break;
        }
      }
    );
  }

  // Subjects for opening file carousel and file details
  fileCarouselSubject: Subject<any> = new Subject();
  fileDetailsSubject: Subject<any> = new Subject();
  fileUploadSubject: Subject<any> = new Subject();

  openUploadPanel(event: DragEvent) {
    if (event.dataTransfer?.types.includes('Files')) {
      this.fileUploadSubject.next(true);
    }
  }

  openToast(message: string, icon: string) {
    this.toastService.data.next({
      message: message,
      icon: icon,
    });
  }

  openFileCarousel(counter: string) {
    this.fileCarouselSubject.next(counter);
  }

  openFileDetails(elementIndex: number, elementType: string) {
    if (this.selectedDirectories.length + this.selectedFiles.length === 1) {
      let title = '';
      if (elementType === ConstNames.FILE) {
        title = 'File details';
      } else if (elementType === ConstNames.DIRECTORY) {
        title = 'Directory details';
      }
      this.fileDetailsSubject.next({
        index: elementIndex,
        type: elementType,
        title: title,
      });
    }
  }

  openModal(config: ModalConfig) {
    this.modalService.input.next(config);
  }

  openPermanentlyDeleteModal() {
    if (this.selectedFiles.length + this.selectedDirectories.length > 1) {
      permanentlyDeleteModalConfig.fields[0].value = `Do you want to permanently delete these ${this.selectedFiles.length + this.selectedDirectories.length
        } items?`;
    } else {
      permanentlyDeleteModalConfig.fields[0].value =
        'Do you want to permanently delete this item?';
    }

    this.openModal(permanentlyDeleteModalConfig);
  }

  openDeleteModal() {
    if (this.selectedFiles.length + this.selectedDirectories.length > 1) {
      deleteModalConfig.fields[0].value = `Do you want to move these ${this.selectedDirectories.length + this.selectedFiles.length
        } items to trash?`;
    } else {
      deleteModalConfig.fields[0].value = `Do you want to move this item to trash?`;
    }

    this.openModal(deleteModalConfig);
  }
  openRenameDirectoryModal(id: number) {
    if (this.selectedDirectories.length === 1) {
      renameDirectoryModalConfig.data = this.directory.directories[id].id;
      renameDirectoryModalConfig.fields[1].value =
        this.directory.directories[id].name;
      this.openModal(renameDirectoryModalConfig);
    }
  }

  openRenameFileModal(id: number) {
    if (this.selectedFiles.length === 1) {
      renameFileModalConfig.data = this.directory.files[id].id;
      renameFileModalConfig.fields[1].value = this.directory.files[id].name;
      this.openModal(renameFileModalConfig);
    }
  }

  openCreateDirectoryModal() {
    this.openModal(createDirectoryModalConfig);
  }

  openRestoreModal() {
    if (this.selectedFiles.length + this.selectedDirectories.length > 1) {
      restoreModalConfig.fields[0].value = `Do you want to restore these ${this.selectedDirectories.length + this.selectedFiles.length
        } items?`;
    } else {
      restoreModalConfig.fields[0].value = `Do you want to restore this item?`;
    }

    this.openModal(restoreModalConfig);
  }

  getDirectory() {
    this.data.getDirectory(this.directoryId).subscribe({
      next: (data: Directory[]) => {
        this.directory = data[0];
        if (this.directoryId == '') {
          localStorage.setItem('mainDirectoryId', this.directory.id);
          this.router.navigate(['/' + this.directory.id]);
        }

        this.directory.files.forEach((file) => {
          if (FileFormats.FILES_TO_DISPLAY.includes(file.type)) {
            this.data.getFile(file, this.directory.access_key).subscribe({
              next: (data) => {
                // Convert blob to URL
                const urlCreator = window.URL || window.webkitURL;
                file.src = this.sanitizer.bypassSecurityTrustUrl(
                  urlCreator.createObjectURL(data)
                );
              },
            });
          }
        });
      },
    });
  }

  createDirectory(name: string) {
    let newDir = new DirectoryBuilder()
      .setName(name)
      .setParentDirectory(this.directory.id);
    if (name) {
      this.data.createDirectory(newDir, this.directory.access_key).subscribe({
        next: (data: Directory) => {
          if (data) {
            this.directory.directories.push(data);
          }
        },
      });
    }
  }

  openContextMenu(event: any, elementIndex: number, elementType: string) {
    event.preventDefault();

    this.contextMenuElementIndex = elementIndex;
    this.contextMenuElementType = elementType;

    if (!this.contextMenu) {
      return;
    }

    this.contextMenu.nativeElement.classList.remove('scale-0');
    this.contextMenu.nativeElement.style.transform = `translate(${event.pageX}px, ${event.pageY}px)`;
  }

  closeContextMenu() {
    if (!this.contextMenu) {
      return;
    }

    this.contextMenuElementIndex = 0;

    this.contextMenu.nativeElement.classList.add('scale-0');
    this.contextMenu.nativeElement.style.transform = null;
  }

  deleteFiles(files: FileModel[]) {
    const trashAccessKey = localStorage.getItem('trashAccessKey');
    if (!trashAccessKey) return;

    let destinationDirectory = new DirectoryBuilder()
      .setId(decodeJWT(trashAccessKey)['id'])
      .setAccessKey(trashAccessKey)
      .build();

    this.moveFiles(files, this.directory, destinationDirectory);
  }

  moveFiles(
    files: FileModel[],
    filesParentDirectory: Directory,
    destinationDirectory: Directory
  ) {
    let directoriesWithFiles = [
      new DirectoryBuilder()
        .setId(filesParentDirectory.id)
        .setAccessKey(filesParentDirectory.access_key)
        .setFiles(files)
        .build(),
    ];

    this.data.moveFiles(directoriesWithFiles, destinationDirectory).subscribe({
      next: (data) => {
        if (data.status === 200) {
          let filesAdded = false;

          const CURRENT_DIR_FILES_IDS = this.directory.files.map((x) => x.id);
          const FIRST_MOVED_FILE_ID = files.at(0)?.id || '';

          if (!CURRENT_DIR_FILES_IDS.includes(FIRST_MOVED_FILE_ID)) {
            this.selectedFiles = files;
            this.insertFilesInOrder(files);
            filesAdded = true;
          } else {
            this.removeFilesFromCurrentDirectory(files);
          }
        }
      },
    });
  }

  removeFilesFromCurrentDirectory(files: FileModel[]) {
    this.directory.files = this.directory.files.filter(
      (x) => !files.includes(x)
    );
  }

  insertFilesInOrder(files: FileModel[]) {
    let currentDirectoryFilesLength = this.directory.files.length;

    files.forEach((file) => {
      let lo = 0;
      let hi = currentDirectoryFilesLength;

      while (lo < hi) {
        const mid = Math.floor(lo + (hi - lo) / 2);
        const val = parseInt(this.directory.files[mid].id.substring(0, 8), 16);

        const insertedFileTimestamp = parseInt(file.id.substring(0, 8), 16);

        if (insertedFileTimestamp > val) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }

      this.directory.files.splice(lo, 0, file);
      currentDirectoryFilesLength += 1;
    });
  }

  updateFile(file: FileModel) {
    return this.data.updateFile(file, this.directory.access_key).subscribe({
      next: (data) => {
        if (data.status === 204) {
          // Check if file name was changed and update it in template
          let changedFile = this.directory.files.find((x) => x.id == file.id);
          if (changedFile && changedFile.name != file.name) {
            changedFile.name = file.name;
          }
        }
      },
    });
  }

  deleteDirectories(directories: Directory[]) {
    const trashAccessKey = localStorage.getItem('trashAccessKey');
    if (!trashAccessKey) return;

    let destinationDirectory = new DirectoryBuilder()
      .setId(decodeJWT(trashAccessKey)['id'])
      .setAccessKey(trashAccessKey)
      .build();

    this.moveDirectories(directories, destinationDirectory);
  }

  moveDirectories(directories: Directory[], destinationDirectory: Directory) {
    this.data.moveDirectories(directories, destinationDirectory).subscribe({
      next: (data) => {
        let filesAdded = false;
        if (data.status === 200) {
          directories.forEach((element) => {
            if (
              !this.directory.directories.map((x) => x.id).includes(element.id)
            ) {
              this.directory.directories = [
                ...this.directory.directories,
                element,
              ];
              filesAdded = true;
            }
          });

          if (!filesAdded) {
            this.directory.directories = this.directory.directories.filter(
              (x) => !directories.includes(x)
            );
          }
        }
      },
    });
  }

  updateDirectory(directory: Directory, newDirectoryAccessKey?: string) {
    return this.data
      .updateDirectory(directory, newDirectoryAccessKey)
      .subscribe({
        next: (data) => {
          if (data.status === 204) {
            let directoryBeforeUpdate = this.directory.directories.find(
              (x) => x.id === directory.id
            );
            if (
              directoryBeforeUpdate &&
              directoryBeforeUpdate.name !== directory.name
            ) {
              directoryBeforeUpdate.name = directory.name;
            }
          }
        },
      });
  }

  // Event when user uses keyboard key on file
  onFileKeydown(event: KeyboardEvent, index: number, type: string) {
    // File hotkeys
    if (type === ConstNames.FILE) {
      switch (event.key) {
        case 'F1':
          this.openFileDetails(index, type);
          break;
        case 'F2':
          this.openRenameFileModal(index);
          break;
        case 'F4':
          this.openDeleteModal();
          break;
      }
    }
    // Directory hotkeys
    else if (type === ConstNames.DIRECTORY) {
      switch (event.key) {
        case 'F1':
          this.openFileDetails(index, type);
          break;
        case 'F2':
          this.openRenameDirectoryModal(index);
          break;
        case 'F4':
          this.openDeleteModal();
          break;
      }
    }
  }

  downloadFile(file: FileModel) {
    this.data.getFile(file, this.directory.access_key).subscribe({
      next: (data) => {
        // Convert blob to URL
        const urlCreator = window.URL || window.webkitURL;

        let link = document.createElement('a');
        link.href = urlCreator.createObjectURL(data);
        link.download = file.name;
        link.click();
        link.remove();
      },
    });
  }

  moveToDirectory(directory: Directory) {
    if (this.selectedDirectories.length > 0) {
      this.moveDirectories([...this.selectedDirectories], directory);
    }
    if (this.selectedFiles.length > 0) {
      this.moveFiles([...this.selectedFiles], this.directory, directory);
    }
  }

  addSelectedDirectory(event: MouseEvent, directory: Directory) {
    if (event.shiftKey) {
      if (this.lastSelectedElement === this.constElementNames.DIRECTORY) {
        let lastSelectedElement = this.selectedDirectories.at(-1);
        let lastSelectedElementIndex = 0;

        let selectedElementIndex = 0;
        this.directory.directories.forEach((element, index) => {
          if (element === directory) {
            selectedElementIndex = index;
          } else if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        });

        let [startIndex, endIndex] = [
          lastSelectedElementIndex,
          selectedElementIndex,
        ].sort((a, b) => a - b);

        this.directory.directories
          .slice(startIndex, endIndex + 1)
          .forEach((element) => {
            if (!this.selectedDirectories.includes(element)) {
              this.selectedDirectories.push(element);
            }
          });
      } else if (this.lastSelectedElement === this.constElementNames.FILE) {
        let lastSelectedElement =
          this.selectedFiles.at(-1) || new FileBuilder().build();
        let lastSelectedElementIndex = 0;

        this.directory.files.forEach((element, index) => {
          if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        });

        let selectedElementIndex = 0;
        this.directory.directories.forEach((element, index) => {
          if (element === directory) {
            selectedElementIndex = index;
          }
        });

        this.directory.directories
          .slice(selectedElementIndex)
          .forEach((element) => {
            if (!this.selectedDirectories.includes(element)) {
              this.selectedDirectories.push(element);
            }
          });
        this.directory.files
          .slice(0, lastSelectedElementIndex + 1)
          .forEach((element) => {
            if (!this.selectedFiles.includes(element)) {
              this.selectedFiles.push(element);
            }
          });
      }
    } else if (event.ctrlKey) {
      if (!this.selectedDirectories.includes(directory)) {
        this.selectedDirectories.push(directory);
      } else {
        this.selectedDirectories = this.selectedDirectories.filter(
          (x) => x != directory
        );
      }
    } else if (event.button === RIGHT_CLICK) {
      if (!this.selectedDirectories.includes(directory)) {
        this.selectedDirectories = [directory];
        this.selectedFiles = [];
      }

      this.lastSelectedElement = this.constElementNames.DIRECTORY;
      return;
    } else {
      let dragNewDirectory =
        event.type === 'dragstart' &&
        !this.selectedDirectories.includes(directory);
      if (event.type === 'click' || dragNewDirectory) {
        this.selectedDirectories = [directory];
        this.selectedFiles = [];
      }
    }
    this.lastSelectedElement = this.constElementNames.DIRECTORY;
  }

  addSelectedFile(event: MouseEvent, file: FileModel) {
    if (event.shiftKey) {
      if (this.lastSelectedElement === this.constElementNames.FILE) {
        let lastSelectedElement = this.selectedFiles.at(-1);
        let lastSelectedElementIndex = 0;

        let selectedElementIndex = 0;
        this.directory.files.forEach((element, index) => {
          if (element === file) {
            selectedElementIndex = index;
          } else if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        });

        let [startIndex, endIndex] = [
          lastSelectedElementIndex,
          selectedElementIndex,
        ].sort((a, b) => a - b);

        this.directory.files
          .slice(startIndex, endIndex + 1)
          .forEach((element) => {
            if (!this.selectedFiles.includes(element)) {
              this.selectedFiles.push(element);
            }
          });
      } else if (
        this.lastSelectedElement === this.constElementNames.DIRECTORY
      ) {
        let lastSelectedElement = this.selectedDirectories.at(-1);
        let lastSelectedElementIndex = 0;

        this.directory.directories.forEach((element, index) => {
          if (element === lastSelectedElement) {
            lastSelectedElementIndex = index;
          }
        });

        let selectedElementIndex = 0;
        this.directory.files.forEach((element, index) => {
          if (element === file) {
            selectedElementIndex = index;
          }
        });

        this.directory.directories
          .slice(lastSelectedElementIndex)
          .forEach((element) => {
            if (!this.selectedDirectories.includes(element)) {
              this.selectedDirectories.push(element);
            }
          });
        this.directory.files
          .slice(0, selectedElementIndex + 1)
          .forEach((element) => {
            if (!this.selectedFiles.includes(element)) {
              this.selectedFiles.push(element);
            }
          });
      }
    } else if (event.ctrlKey) {
      if (!this.selectedFiles.includes(file)) {
        this.selectedFiles.push(file);
      } else {
        this.selectedFiles = this.selectedFiles.filter((x) => x != file);
      }
    } else if (event.button === RIGHT_CLICK) {
      if (!this.selectedFiles.includes(file)) {
        this.selectedFiles = [file];
        this.selectedDirectories = [];
      }
      this.lastSelectedElement = this.constElementNames.FILE;
      return;
    } else {
      const dragNewFile =
        event.type === 'dragstart' && !this.selectedFiles.includes(file);
      if (event.type === 'click' || dragNewFile) {
        this.selectedFiles = [file];
        this.selectedDirectories = [];
      }
    }
    this.lastSelectedElement = this.constElementNames.FILE;
  }

  permanentlyDeleteFiles(files: FileModel[]) {
    let body = [
      {
        id: this.directory.id,
        access_key: this.directory.access_key,
        files: files.map((x) => x.id),
      },
    ];

    this.data.permanentlyDeleteMultipleFiles(body).subscribe({
      next: (data) => {
        if (data.status === 200) {
          this.directory.files = this.directory.files.filter(
            (x) => !files.includes(x)
          );
        }
      },
    });
  }

  permanentlyDeleteDirectories(directories: Directory[]) {
    let body = directories.map((x) => ({ id: x.id, access_key: x.access_key }));
    this.data.deleteDirectories(body).subscribe({
      next: (data) => {
        if (data.status === 204) {
          this.directory.directories = this.directory.directories.filter(
            (x) => !directories.includes(x)
          );
        }
      },
    });
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'x':
        if (event.ctrlKey) {
          localStorage.removeItem('cutFiles');
          localStorage.removeItem('cutDirectories');
          localStorage.removeItem('cutFilesParentDirectory');

          if (this.selectedFiles.length > 0) {
            localStorage.setItem(
              'cutFiles',
              JSON.stringify(this.selectedFiles)
            );
            localStorage.setItem(
              'cutFilesParentDirectory',
              JSON.stringify(this.directory)
            );
          }
          if (this.selectedDirectories.length > 0) {
            localStorage.setItem(
              'cutDirectories',
              JSON.stringify(this.selectedDirectories)
            );
          }
        }
        break;
      case 'v':
        if (event.ctrlKey) {
          let cutDirectories = localStorage.getItem('cutDirectories');
          let cutFiles = localStorage.getItem('cutFiles');
          let cutFilesParentDirectory = localStorage.getItem(
            'cutFilesParentDirectory'
          );

          if (cutDirectories) {
            let parsedDirectories = JSON.parse(cutDirectories).map(
              (element: any) => {
                return new DirectoryBuilder()
                  .setId(element._id)
                  .setAccessKey(element._access_key)
                  .setName(element._name)
                  .setParentDirectory(element._parent_directory)
                  .build();
              }
            );
            this.moveDirectories(parsedDirectories, this.directory);
          }

          if (cutFiles && cutFilesParentDirectory) {
            let parsedFiles = JSON.parse(cutFiles).map((element: any) => {
              let fileSrc =
                element._src.changingThisBreaksApplicationSecurity || '';

              let safeFileUrl: SafeUrl = '';

              if (fileSrc) {
                safeFileUrl = this.sanitizer.bypassSecurityTrustUrl(fileSrc);
              }

              return new FileBuilder()
                .setId(element._id)
                .setName(element._name)
                .setParentDirectory(element._parent_directory)
                .setUser(element._user)
                .setType(element._type)
                .setSize(element._size)
                .setSrc(safeFileUrl)
                .build();
            });

            let parsedDirectory = JSON.parse(cutFilesParentDirectory);

            let parentDirectory = new DirectoryBuilder()
              .setId(parsedDirectory._id)
              .setAccessKey(parsedDirectory._access_key)
              .build();

            this.moveFiles(parsedFiles, parentDirectory, this.directory);
          }

          localStorage.removeItem('cutFiles');
          localStorage.removeItem('cutFilesParentDirectory');
          localStorage.removeItem('cutDirectories');
        }
        break;
      case 'a':
        if (
          event.ctrlKey &&
          (event.target as HTMLElement).tagName !== 'INPUT'
        ) {
          event.preventDefault();

          this.selectedDirectories = [...this.directory.directories];
          this.selectedFiles = [...this.directory.files];
        }
        break;
      case 'Delete':
        if (
          event.shiftKey &&
          this.selectedFiles.length + this.selectedDirectories.length > 0
        ) {
          this.openPermanentlyDeleteModal();
        } else if (
          this.selectedFiles.length + this.selectedDirectories.length >
          0
        ) {
          this.openDeleteModal();
        }
        break;
      case 'F4':
        if (this.selectedFiles.length + this.selectedDirectories.length > 0) {
          this.openDeleteModal();
        }
        break;
    }
  }

  restoreFiles(files: FileModel[]) {
    this.data.restoreFiles(files).subscribe({
      next: (data: any) => {
        if (data.status === 200) {
          this.directory.files = this.directory.files.filter(
            (x) => !files.includes(x)
          );

          this.openToast(`Files (${data.body['updated']}) restored`, 'check');
        }
      },
    });
  }

  restoreDirectories(directories: Directory[]) {
    this.data.restoreDirectories(directories).subscribe({
      next: (data: any) => {
        if (data.status === 200) {
          this.directory.directories = this.directory.directories.filter(
            (x) => !directories.includes(x)
          );
          this.openToast(
            `Directories (${data.body['updated']}) restored`,
            'check'
          );
        }
      },
    });
  }
}

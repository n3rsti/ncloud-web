import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Directory, DirectoryBuilder } from '../models/directory.model';
import { FileModel } from '../models/file.model';
import { FileFormats } from '../utils';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class DirectoryService {
  directory: Directory = new DirectoryBuilder().build();
  selectedFiles: FileModel[] = [];
  selectedDirectories: Directory[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private data: DataService,
    private router: Router
  ) { }

  getDirectory(id: string) {
    this.data.getDirectory(id).subscribe({
      next: (data: Directory[]) => {
        this.directory = data[0];
        if (id == '') {
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
}

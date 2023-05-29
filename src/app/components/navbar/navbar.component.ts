import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {DataService} from "../../services/data.service";
import {FileModel} from "../../models/file.model";
import {Directory} from "../../models/directory.model";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent){
    if(event.key === '/'){
      if(!this.searchOpened){
        event.preventDefault();
        this.searchOpened = true;
        this.search?.nativeElement.querySelector("input").focus();
      }
    }
    else if(event.key === 'Escape'){
      this.searchOpened = false;
      this.search?.nativeElement.querySelector("input").blur();
    }
  }

  username: string = '';
  searchInput = new FormControl('');
  @ViewChild('search', {static: false}) search: ElementRef | undefined;

  searchFileResults: FileModel[] = [];
  searchDirectoryResults: Directory[] = [];
  searchOpened = false;

  constructor(private data: DataService) {
  }

  ngOnInit(){
    this.username = localStorage.getItem("username") || "";
  }

  onChange(){
    let value = this.searchInput.value;
    if(value){
      this.data.searchDirectories(value).subscribe({
        next: (data) => {
          this.searchFileResults = data.Files
          this.searchDirectoryResults = data.Directories
        }
      });
    }
    else {
      this.searchFileResults = this.searchDirectoryResults = [];
    }

  }

  addBorderClass(){
    this.search?.nativeElement.classList.add("border-indigo-600");
  }

  removeBorderClass(){
    this.search?.nativeElement.classList.remove("border-indigo-600");
  }

  openSearchInput(){
    this.searchOpened = true;
    this.search?.nativeElement.querySelector("input").focus();
  }

  resetSearch(){
    this.searchOpened = false;
    this.searchFileResults = this.searchDirectoryResults = [];
    this.searchInput.reset();
  }
}

import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {DataService} from "../../services/data.service";
import {FileModel} from "../../models/file.model";
import {Directory} from "../../models/directory.model";
import {decodeJWT} from "../../utils";

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

        this.openSearchInput();
      }
    }
    else if(event.key === 'Escape'){
      this.searchOpened = false;
      this.search?.nativeElement.querySelector("input").blur();
    }
    else if(event.key === 'ArrowDown'){
      if(this.searchOpened && this.searchInput.value){
        // Prevent text indicator from going back and forth
        event.preventDefault();

        if(this.searchElementSelected === -1){
          this.searchElementSelected = 0;
        }
        else {
          let listLength = this.searchFileResults.length + this.searchDirectoryResults.length + 2;
          this.removeSelectedElementClass();

          this.searchElementSelected += 1;
          if(this.searchElementSelected === listLength){
            this.searchElementSelected = 0;
          }
        }
        this.addSelectedElementClass();
      }
    }
    else if(event.key === 'ArrowUp'){
      // Prevent text indicator from going back and forth
      event.preventDefault();
      
      if(this.searchOpened && this.searchInput.value){
        let listLength = this.searchFileResults.length + this.searchDirectoryResults.length + 2;
        if(this.searchElementSelected === -1){
          this.searchElementSelected = listLength - 1;
        }
        else {
          this.removeSelectedElementClass();

          this.searchElementSelected -= 1;
          if(this.searchElementSelected === -1){
            this.searchElementSelected = listLength -1;
          }
        }
        this.addSelectedElementClass();
      }
    }
    else if(event.key === 'Enter'){
      if(this.searchOpened && this.searchElementSelected !== -1){
        (document.querySelectorAll("#search_list li")[this.searchElementSelected] as HTMLElement).click();
      }
    }
  }

  username: string = '';
  searchInput = new FormControl('');
  @ViewChild('search', {static: false}) search: ElementRef | undefined;


  homeId = '';
  trashId = '';
  searchFileResults: FileModel[] = [];
  searchDirectoryResults: Directory[] = [];
  searchOpened = false;
  searchElementSelected = -1;

  constructor(private data: DataService) {
  }

  ngOnInit(){
    this.homeId = localStorage.getItem("mainDirectoryId") || "";
    this.trashId = decodeJWT(localStorage.getItem("trashAccessKey") || "")["id"];
    this.username = localStorage.getItem("username") || "";
  }

  onInputChange(){
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

    // Reset selected element
    if(this.searchElementSelected !== -1){
      this.removeSelectedElementClass();
      this.searchElementSelected = -1;
    }
  }

  addSearchBorderClass(){
    this.search?.nativeElement.classList.add("border-indigo-600");
  }

  removeSearchBorderClass(){
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


    if(this.searchElementSelected !== -1){
      this.removeSelectedElementClass();
      this.searchElementSelected = -1;
    }

  }

  addSelectedElementClass(){
    document.querySelectorAll("#search_list li")[this.searchElementSelected].classList.add("bg-gray-200");
  }

  removeSelectedElementClass(){
    document.querySelectorAll("#search_list li")[this.searchElementSelected].classList.remove("bg-gray-200");
  }
}

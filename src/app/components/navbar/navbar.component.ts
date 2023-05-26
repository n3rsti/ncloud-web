import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent){
    if(event.key === '/'){
      event.preventDefault();
      this.searchOpened = true;
      this.search?.nativeElement.querySelector("input").focus();
    }
    else if(event.key === 'Escape'){
      this.searchOpened = false;
      this.search?.nativeElement.querySelector("input").blur();
    }
  }

  username: string = '';
  searchInput = new FormControl('');
  @ViewChild('search', {static: false}) search: ElementRef | undefined;

  searchResults: object[] = [];
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
          console.log(data);
        }
      });
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
}

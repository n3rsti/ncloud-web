import {Component, Input} from '@angular/core';
import {decodeJWT} from "../../utils";
import {ActivatedRoute} from "@angular/router";
import {Directory, DirectoryBuilder} from "../../models/directory.model";

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.scss']
})
export class SideNavbarComponent {
  trashId = "";
  currentId = "";
  mainDirectoryId = "";
  @Input() directory: Directory = new DirectoryBuilder().build();

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.currentId = params["id"];
    })
  }


  ngOnInit(){
    const trashAccessKey = localStorage.getItem("trashAccessKey") || "";
    this.trashId = decodeJWT(trashAccessKey)["id"];

    this.mainDirectoryId = localStorage.getItem("mainDirectoryId") || '';
  }
}

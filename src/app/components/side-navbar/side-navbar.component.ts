import { Component, Input } from '@angular/core';
import { decodeJWT } from '../../utils';
import { ActivatedRoute } from '@angular/router';
import { Directory, DirectoryBuilder } from '../../models/directory.model';
import { SideNavbarService } from 'src/app/services/side-navbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.scss'],
})
export class SideNavbarComponent {
  trashId = '';
  currentId = '';
  mainDirectoryId = '';

  sideNavbarSub: Subscription | undefined;

  opened = false;
  @Input() directory: Directory = new DirectoryBuilder().build();

  constructor(
    private route: ActivatedRoute,
    private sideNavbarService: SideNavbarService
  ) {
    this.route.params.subscribe((params) => {
      this.currentId = params['id'];
    });
  }

  ngOnDestroy() {
    this.sideNavbarSub?.unsubscribe();
  }

  ngOnInit() {
    const trashAccessKey = localStorage.getItem('trashAccessKey') || '';
    this.trashId = decodeJWT(trashAccessKey)['id'];

    this.mainDirectoryId = localStorage.getItem('mainDirectoryId') || '';

    this.sideNavbarSub = this.sideNavbarService.openSubject.subscribe(() => {
      this.opened = true;
    });
  }

  closeSideNavbar() {
    this.opened = false;
  }
}

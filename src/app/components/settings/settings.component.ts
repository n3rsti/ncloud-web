import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  constructor(private router: Router) { }

  routes = {
    ACCOUNT: 'account',
  };

  selectedRoute = '';

  ngOnInit() {
    let url = this.router.url;
    switch (true) {
      case url.includes(this.routes.ACCOUNT):
        this.selectedRoute = this.routes.ACCOUNT;
        break;
    }
  }
}

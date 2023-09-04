import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  returnUrl = '';
  loginGroup: FormGroup;

  isInvalidLogin = false;
  isNewUser = false;

  constructor(
    private data: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.loginGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.titleService.setTitle('Sign in | NCloud');
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['return'] || '/';
      this.isNewUser = params['userCreated'] || false;
    });
  }

  submitForm() {
    this.isInvalidLogin = false;
    this.isNewUser = false;
    this.data.login(this.username, this.password).subscribe({
      next: (data: any) => {
        if (data.status === 200) {
          localStorage.setItem('access_token', data.body['access_token']);
          localStorage.setItem('refresh_token', data.body['refresh_token']);
          localStorage.setItem('username', data.body['username']);
          localStorage.setItem('trashAccessKey', data.body['trash_access_key']);

          this.router.navigate([this.returnUrl]);
        }
      },
      error: (data) => {
        if (data.status === 403) {
          this.isInvalidLogin = true;
        }
      },
    });
  }

  get username() {
    return this.loginGroup.get('username')?.value;
  }

  get password() {
    return this.loginGroup.get('password')?.value;
  }
}

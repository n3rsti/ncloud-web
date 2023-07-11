import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerGroup: FormGroup;
  isInvalid = false;
  isConflict = false;

  constructor(private data: DataService, private router: Router) {
    this.registerGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  submitForm() {
    return this.data.register(this.username, this.password).subscribe({
      next: (data) => {
        if (data.status === 201) {
          this.router.navigate(['/login'], {
            queryParams: {
              userCreated: true,
            },
          });
        }
      },
      error: (data) => {
        if (data.status === 409) {
          this.isConflict = true;
        } else if (data.status === 400) {
          this.isInvalid = true;
        }
      },
    });
  }

  get username() {
    return this.registerGroup.get('username')?.value;
  }

  get password() {
    return this.registerGroup.get('password')?.value;
  }
}

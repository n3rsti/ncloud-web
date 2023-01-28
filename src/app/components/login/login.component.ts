import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  loginGroup: FormGroup

  constructor(
    private data: DataService
  ) {
    this.loginGroup = new FormGroup(
      {
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
      }
    );
  }

  submitForm(){
    this.data.login(this.username, this.password).subscribe({
      next: (data: any) => {
        if(data["access_token"] != "" && data["refresh_token"] != ""){
          localStorage.setItem("access_token", data["access_token"]);
          localStorage.setItem("refresh_token", data["refresh_token"]);
        }
      }
    })
  }
  get username() { return this.loginGroup.get('username')?.value; }
  get password() { return this.loginGroup.get('password')?.value; }


}

import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Config} from "../config";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string) {
    return this.http.post(`${Config.Host}/api/login`,
      {
        "username": username,
        "password": password
      }
    )
  }

  refreshToken(){
    return this.http.get(`${Config.Host}/api/token/refresh`, {observe: 'response'});
  }


}



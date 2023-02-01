import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Config} from "../config";
import {map} from "rxjs";
import {DirectoryBuilder} from "../models/directory.model";

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

  getDirectory(id: string){
    return this.http.get(`${Config.Host}/api/directories/${id}`).pipe(
      map((data: any) => {
        return new DirectoryBuilder()
          .setId(data.id)
          .setName(data.name)
          .setParentDirectory(data.parent_directory)
          .setUser(data.user)
          .build();
      })
    )
  }


}



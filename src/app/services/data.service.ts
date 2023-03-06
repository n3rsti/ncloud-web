import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Config} from "../config";
import {map} from "rxjs";
import {DirectoryBuilder} from "../models/directory.model";
import {FileBuilder} from "../models/file.model";


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
    let reqUrl = `${Config.Host}/api/directories`;
    if(id){
      reqUrl += '/' + id;
    }

    return this.http.get(reqUrl).pipe(
      map((data: any) => (data || Array()).map((directory: any) => {
        return new DirectoryBuilder()
          .setId(directory._id)
          .setName(directory.name)
          .setParentDirectory(directory.parent_directory)
          .setUser(directory.user)
          .setDirectories(
            directory.directories.map((dir: any) => {
              return new DirectoryBuilder()
                .setId(dir._id)
                .setName(dir.name)
                .setParentDirectory(dir.parent_directory)
                .setUser(dir.user)
                .build();
            })
          )
          .setFiles(
            directory.files.map((file: any) => {
              return new FileBuilder()
                .setId(file._id)
                .setName(file.name)
                .setParentDirectory(file.parent_directory)
                .setUser(file.user)
                .setType(file.type)
                .setSize(file.size)
                .build()
            })
          )
          .build();

      }))
    )

  }

  getFile(id: string,){
    return this.http.get(Config.Host + `/files/${id}`, {responseType: 'blob', observe: 'body'});
  }

  createDirectory(name: string, parentDirectory: string){
    return this.http.post(Config.Host + '/api/directories', {
      'name': name,
      'parent_directory': parentDirectory
    }).pipe(
      map((data: any) => (data || Array().map((directory: any) => {
        return new DirectoryBuilder()
          .setId(directory.id)
          .setName(directory.name)
          .build()
      })))
    )
  }

  uploadFiles(files: FileList, directoryId: string){
    let formData = new FormData();
    formData.append("file", files[0]);
    formData.append("directory", directoryId);

    return this.http.post(Config.Host + '/api/upload', formData).pipe(
      map((data: any) => (data || Array().map((file: any) => {
        return new FileBuilder()
          .setName(file.name)
          .setId(file.id)
          .build();
      })))
    );
  }


}



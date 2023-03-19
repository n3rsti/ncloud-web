import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Config} from "../config";
import {map} from "rxjs";
import {Directory, DirectoryBuilder} from "../models/directory.model";
import {FileBuilder, FileModel} from "../models/file.model";


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

  getDirectory(directoryId: string){
    let reqUrl = `${Config.Host}/api/directories`;
    if(directoryId){
      reqUrl += '/' + directoryId;
    }

    return this.http.get(reqUrl).pipe(
      map((data: any) => (data || Array()).map((directory: any) => {
        return new DirectoryBuilder()
          .setId(directory._id)
          .setName(directory.name)
          .setParentDirectory(directory.parent_directory)
          .setUser(directory.user)
          .setAccessKey(directory.access_key)
          .setDirectories(
            directory.directories.map((dir: any) => {
              return new DirectoryBuilder()
                .setId(dir._id)
                .setName(dir.name)
                .setParentDirectory(dir.parent_directory)
                .setUser(dir.user)
                .setAccessKey(dir.access_key)
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
                .setAccessKey(file.access_key)
                .build()
            })
          )
          .build();

      }))
    )

  }

  getFile(file: FileModel){
    let headers = new HttpHeaders({
      'FileAccessKey': file.access_key
    })

    return this.http.get(Config.Host + `/files/${file.id}`, {responseType: 'blob', observe: 'body', headers: headers});
  }

  createDirectory(newDirectory: Directory, accessKey: string){
    let headers = new HttpHeaders({
      'DirectoryAccessKey': accessKey
    })

    return this.http.post(Config.Host + `/api/directories/${newDirectory.parent_directory}`, {
      'name': newDirectory.name,
    }, {headers: headers}).pipe(
      map((data: any) => (data || Array().map((directory: any) => {
        return new DirectoryBuilder()
          .setId(directory.id)
          .setName(directory.name)
          .build()
      })))
    )
  }

  uploadFiles(files: FileList, directory: Directory){
    let headers = new HttpHeaders({
      'DirectoryAccessKey': directory.access_key
    })

    let formData = new FormData();
    formData.append("file", files[0]);

    return this.http.post(Config.Host + `/api/upload/${directory.id}`, formData, {headers: headers}).pipe(
      map((data: any) => (data || Array().map((file: any) => {
        return new FileBuilder()
          .setName(file.name)
          .setId(file.id)
          .setAccessKey(file.access_key)
          .build();
      })))
    );
  }

  updateFile(file: FileModel, directoryAccessKey: string | null){
    let headers = new HttpHeaders({

    })
    if(directoryAccessKey){
      headers = new HttpHeaders({
        'DirectoryAccessKey': directoryAccessKey
      })
    }
    return this.http.patch(Config.Host + `/api/files/${file.id}`,
      {"name": file.name, "parent_directory": file.parent_directory},
      {observe: 'response'})
  }

  deleteFile(file: FileModel){
    let headers = new HttpHeaders({
      'FileAccessKey': file.access_key
    })

    return this.http.delete(Config.Host + `/api/files/${file.id}`, {headers: headers, observe: 'response'})
  }


}



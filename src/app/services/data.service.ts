import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Config } from '../config';
import { map } from 'rxjs';
import { Directory, DirectoryBuilder } from '../models/directory.model';
import { FileBuilder, FileModel } from '../models/file.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post(
      `${Config.Host}/api/login`,
      {
        username: username,
        password: password,
      },
      { observe: 'response' }
    );
  }

  register(username: string, password: string) {
    return this.http.post(
      `${Config.Host}/api/register`,
      {
        username: username,
        password: password,
      },
      { observe: 'response' }
    );
  }

  refreshToken() {
    return this.http.get(`${Config.Host}/api/token/refresh`, {
      observe: 'response',
    });
  }

  getDirectory(directoryId: string) {
    let reqUrl = `${Config.Host}/api/directories`;
    if (directoryId) {
      reqUrl += '/' + directoryId;
    }

    return this.http.get(reqUrl).pipe(
      map((data: any) =>
        (data || Array()).map((directory: any) => {
          return new DirectoryBuilder()
            .setId(directory._id)
            .setName(directory.name)
            .setParentDirectory(directory.parent_directory)
            .setUser(directory.user)
            .setAccessKey(directory.access_key)
            .setCreated(directory.created)
            .setDirectories(
              directory.directories.map((dir: any) => {
                return new DirectoryBuilder()
                  .setId(dir._id)
                  .setName(dir.name)
                  .setParentDirectory(dir.parent_directory)
                  .setAccessKey(dir.access_key)
                  .setCreated(dir.created)
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
                  .setCreated(file.created)
                  .build();
              })
            )
            .build();
        })
      )
    );
  }

  getFile(file: FileModel, directoryAccessKey: string) {
    let headers = new HttpHeaders({
      DirectoryAccessKey: directoryAccessKey,
    });

    return this.http.get(Config.Host + `/files/${file.id}`, {
      responseType: 'blob',
      observe: 'body',
      headers: headers,
    });
  }

  createDirectory(newDirectory: Directory, accessKey: string) {
    let headers = new HttpHeaders({
      DirectoryAccessKey: accessKey,
    });

    return this.http
      .post(
        Config.Host + `/api/directories/${newDirectory.parent_directory}`,
        {
          name: newDirectory.name,
        },
        { headers: headers }
      )
      .pipe(
        map((data: any) =>
          new DirectoryBuilder()
            .setName(data.name)
            .setId(data.id)
            .setParentDirectory(data.parent_directory)
            .setUser(data.user)
            .setAccessKey(data.access_key)
            .build()
        )
      );
  }

  uploadFiles(files: FileList, directory: Directory) {
    let headers = new HttpHeaders({
      DirectoryAccessKey: directory.access_key,
    });

    let formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('upload[]', files[i]);
    }
    return this.http
      .post(Config.Host + `/api/upload/${directory.id}`, formData, {
        headers: headers,
      })
      .pipe(
        map((data: any) =>
          data.map((file: any) => {
            return new FileBuilder()
              .setName(file.name)
              .setId(file.id)
              .setParentDirectory(file.parent_directory)
              .setSize(file.size)
              .setType(file.type)
              .build();
          })
        )
      );
  }

  updateFile(file: FileModel, directoryAccessKey: string) {
    let headers = new HttpHeaders({
      DirectoryAccessKey: directoryAccessKey,
    });
    return this.http.patch(
      Config.Host + `/api/files/${file.id}`,
      {
        name: file.name,
        parent_directory: file.parent_directory,
      },
      { headers: headers, observe: 'response' }
    );
  }

  updateDirectory(directory: Directory, newDirectoryAccessKey?: string) {
    let headers = new HttpHeaders({
      DirectoryAccessKey: directory.access_key,
    });
    if (newDirectoryAccessKey) {
      headers = headers.set('NewDirectoryAccessKey', newDirectoryAccessKey);
    }

    return this.http.patch(
      Config.Host + `/api/directories/${directory.id}`,
      {
        name: directory.name,
      },
      {
        headers: headers,
        observe: 'response',
      }
    );
  }
  deleteDirectory(directory: Directory) {
    let headers = new HttpHeaders({
      DirectoryAccessKey: directory.access_key,
    });

    return this.http.delete(Config.Host + `/api/directories/${directory.id}`, {
      headers: headers,
      observe: 'response',
    });
  }

  deleteDirectories(directories: object) {
    return this.http.post(
      Config.Host + `/api/directories/delete`,
      directories,
      { observe: 'response' }
    );
  }

  searchDirectories(name?: string, parent_directory?: string) {
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    if (parent_directory) {
      params = params.set('parent_directory', parent_directory);
    }

    return this.http
      .get(Config.Host + '/api/directories/search', { params: params })
      .pipe(
        map((data: any) => {
          return {
            Files: data['Files'].map((file: any) =>
              new FileBuilder()
                .setName(file.name)
                .setId(file._id)
                .setParentDirectory(file.parent_directory)
                .setUser(file.user)
                .setType(file.type)
                .build()
            ),
            Directories: data['Directories'].map((directory: any) =>
              new DirectoryBuilder()
                .setName(directory.name)
                .setId(directory._id)
                .setParentDirectory(directory.parent_directory)
                .setUser(directory.user)
                .build()
            ),
          };
        })
      );
  }

  permanentlyDeleteMultipleFiles(body: object) {
    return this.http.post(Config.Host + `/api/files/delete`, body, {
      observe: 'response',
    });
  }

  moveDirectories(
    directoriesWithFiles: Directory[],
    destinationDirectory: Directory
  ) {
    let body = {
      id: destinationDirectory.id,
      access_key: destinationDirectory.access_key,
      items: directoriesWithFiles.map((dir) => ({
        id: dir.id,
        access_key: dir.access_key,
        parent_directory: dir.parent_directory, // optional
      })),
    };
    return this.http.post(Config.Host + `/api/directories/move`, body, {
      observe: 'response',
    });
  }

  moveFiles(directories: Directory[], destinationDirectory: Directory) {
    let body = {
      id: destinationDirectory.id,
      access_key: destinationDirectory.access_key,
      directories: directories.map((dir) => ({
        id: dir.id,
        access_key: dir.access_key,
        files: dir.files.map((x) => x.id),
      })),
    };

    return this.http.post(Config.Host + `/api/files/move`, body, {
      observe: 'response',
    });
  }

  restoreFiles(files: FileModel[]) {
    let body = {
      files: files.map((file) => file.id),
    };

    return this.http.post(Config.Host + '/api/files/restore', body, {
      observe: 'response',
    });
  }

  restoreDirectories(directories: Directory[]) {
    let body = {
      directories: directories.map((directory) => directory.id),
    };

    return this.http.post(Config.Host + '/api/directories/restore', body, {
      observe: 'response',
    });
  }

  copyFiles(
    files: string[],
    sourceAccessKey: string,
    destinationAccessKey: string
  ) {
    let body = {
      files: files,
      source_access_key: sourceAccessKey,
      destination_access_key: destinationAccessKey,
    };

    return this.http.post(Config.Host + '/api/files/copy', body).pipe(
      map((data: any) =>
        data.map((file: any) => {
          return new FileBuilder()
            .setName(file.name)
            .setId(file.id)
            .setParentDirectory(file.parent_directory)
            .setSize(file.size)
            .setType(file.type)
            .build();
        })
      )
    );
  }

  copyDirectories(directories: string[], destination: string) {
    let body = {
      directories: directories,
      destination: destination,
    };

    return this.http.post(Config.Host + '/api/directories/copy', body).pipe(
      map((data: any) =>
        data.map((file: any) => {
          return new DirectoryBuilder()
            .setId(file.id)
            .setName(file.name)
            .setParentDirectory(file.parent_directory)
            .setAccessKey(file.access_key)
            .build();
        })
      )
    );
  }
}

import { FileModel } from './file.model';

export class Directory {
  private _id: string;
  private _name: string;
  private _parent_directory: string;
  private _user: string;
  private _directories: Directory[];
  private _files: FileModel[];

  private _access_key: string;

  constructor(
    id: string,
    name: string,
    parent_directory: string,
    user: string,
    directories: Directory[],
    files: FileModel[],
    accessKey: string
  ) {
    this._id = id;
    this._name = name;
    this._parent_directory = parent_directory;
    this._user = user;
    this._directories = directories;
    this._files = files;
    this._access_key = accessKey;
  }

  get files(): FileModel[] {
    return this._files;
  }

  set files(value: FileModel[]) {
    this._files = value;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get parent_directory(): string {
    return this._parent_directory;
  }

  set parent_directory(value: string) {
    this._parent_directory = value;
  }

  get user(): string {
    return this._user;
  }

  set user(value: string) {
    this._user = value;
  }

  get directories(): Directory[] {
    return this._directories;
  }

  set directories(value: Directory[]) {
    this._directories = value;
  }

  get access_key(): string {
    return this._access_key;
  }

  set access_key(value: string) {
    this._access_key = value;
  }
}

export class DirectoryBuilder extends Directory {
  constructor() {
    super('', '', '', '', [], [], '');
  }

  setId(id: string) {
    this.id = id;
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setParentDirectory(id: string) {
    this.parent_directory = id;
    return this;
  }

  setUser(id: string) {
    this.user = id;
    return this;
  }

  setDirectories(directories: Directory[]) {
    this.directories = directories;
    return this;
  }

  setFiles(files: FileModel[]) {
    this.files = files;
    return this;
  }

  setAccessKey(accessKey: string) {
    this.access_key = accessKey;
    return this;
  }

  build() {
    return new Directory(
      this.id,
      this.name,
      this.parent_directory,
      this.user,
      this.directories,
      this.files,
      this.access_key
    );
  }
}

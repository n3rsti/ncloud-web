import { FileModel } from './file.model';

export class Directory {
  private _id: string;
  private _name: string;
  private _parent_directory: string;
  private _user: string;
  private _directories: Directory[];
  private _files: FileModel[];
  private _created: number;
  private _modified: number;

  private _access_key: string;

  constructor(
    id: string,
    name: string,
    parent_directory: string,
    user: string,
    directories: Directory[],
    files: FileModel[],
    accessKey: string,
    created: number,
    modified: number,
  ) {
    this._id = id;
    this._name = name;
    this._parent_directory = parent_directory;
    this._user = user;
    this._directories = directories;
    this._files = files;
    this._access_key = accessKey;
    this._created = created;
    this._modified = modified;
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

  get created() {
    return this._created;
  }

  set created(value: number) {
    this._created = value;
  }

  get creationDate() {
    return new Date(this.created).toLocaleString();
  }

  get shortCreated() {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }

    return new Intl.DateTimeFormat("en-GB", options).format(this.created);
  }

  get modified() {
    return this._modified;
  }

  set modified(value: number) {
    this._modified = value;
  }

  get modificationDate() {
    return new Date(this.modified).toLocaleString();
  }

  get shortModified() {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }

    return new Intl.DateTimeFormat("en-GB", options).format(this.modified);
  }
  static clone(directory: Directory) {
    return new Directory(
      directory.id,
      directory.name,
      directory.parent_directory,
      directory.user,
      directory.directories,
      directory.files,
      directory.access_key,
      directory.created,
      directory.modified,
    )
  }
}

export class DirectoryBuilder extends Directory {
  constructor() {
    super('', '', '', '', [], [], '', 0, 0);
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

  setCreated(created: number) {
    this.created = created;
    return this;
  }

  setModified(modified: number) {
    this.modified = modified;
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
      this.access_key,
      this.created,
      this.modified
    );
  }
}

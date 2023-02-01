export class Directory {
  protected _id: string;
  protected _name: string;
  protected _parent_directory: string;
  protected _user: string;
  protected _directories: Directory[];


  constructor(id: string, name: string, parent_directory: string, user: string, directories: Directory[]) {
    this._id = id;
    this._name = name;
    this._parent_directory = parent_directory;
    this._user = user;
    this._directories = directories;
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
}

export class DirectoryBuilder extends Directory {
  constructor() {
    super('', '', '', '', []);
  }


  setId(id: string){
    this._id = id;
    return this;
  }

  setName(name: string){
    this._name = name;
    return this;
  }

  setParentDirectory(id: string){
    this._parent_directory = id;
    return this;
  }

  setUser(id: string){
    this._user = id;
    return this;
  }

  setDirectories(directories: Directory[]){
    this._directories = directories;
    return this;
  }

  build(){
    return new Directory(this._id, this._name, this._parent_directory, this._user, this._directories);
  }
}

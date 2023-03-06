import {SafeUrl} from "@angular/platform-browser";

interface additionalData {
  name: string;
  value: string | number;
}

export class FileModel {
  private _id: string;
  private _name: string;
  private _parent_directory: string;
  private _user: string;
  private _type: string;
  private _src: SafeUrl = '';
  private _size: number;
  private _additional_data: [additionalData] | null = null;


  constructor(id: string, name: string, parent_directory: string, user: string, type: string, size: number) {
    this._id = id;
    this._name = name;
    this._parent_directory = parent_directory;
    this._user = user;
    this._type = type;
    this._size = size;
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

  setId(id: string){
    this.id = id;
    return this;
  }


  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }


  get src(): SafeUrl {
    return this._src;
  }

  set src(value: SafeUrl) {
    this._src = value;
  }

  get size(): number {
    return this._size;
  }

  set size(value: number) {
    this._size = value;
  }


  get additional_data(): [additionalData] | null {
    return this._additional_data;
  }

  set additional_data(value: [additionalData] | null) {
    this._additional_data = value;
  }

  get creationDate(){
    return new Date(parseInt(this.id.substring(0, 8), 16) * 1000);
  }
}

export class FileBuilder extends FileModel {

  constructor() {
    super('', '', '', '', '', 0);
  }

  setName(name: string){
    this.name = name;
    return this;
  }

  setParentDirectory(parent_directory: string){
    this.parent_directory = parent_directory;
    return this;
  }

  setUser(user: string){
    this.user = user;
    return this;
  }

  setType(type: string){
    this.type = type;
    return this;
  }

  setSize(size: number){
    this.size = size;
    return this;
  }

  build(){
    return new FileModel(this.id, this.name, this.parent_directory, this.user, this.type, this.size);
  }

}

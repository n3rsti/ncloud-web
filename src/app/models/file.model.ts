import { SafeUrl } from '@angular/platform-browser';

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
  private _created: number;
  private _modified: number;

  constructor(
    id: string,
    name: string,
    parent_directory: string,
    user: string,
    type: string,
    size: number,
    src: SafeUrl,
    created: number,
    modified: number,
  ) {
    this._id = id;
    this._name = name;
    this._parent_directory = parent_directory;
    this._user = user;
    this._type = type;
    this._size = size;
    this._src = src;
    this._created = created;
    this._modified = modified;
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

  get humanReadableSize(): string {
    let bytes = this.size;
    let dp = 1;

    const thresh = 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (
      Math.round(Math.abs(bytes) * r) / r >= thresh &&
      u < units.length - 1
    );

    return bytes.toFixed(dp) + ' ' + units[u];
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


}

export class FileBuilder extends FileModel {
  constructor() {
    super('', '', '', '', '', 0, '', 0, 0);
  }

  setId(id: string) {
    this.id = id;
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setParentDirectory(parent_directory: string) {
    this.parent_directory = parent_directory;
    return this;
  }

  setUser(user: string) {
    this.user = user;
    return this;
  }

  setSrc(value: SafeUrl) {
    this.src = value;
    return this;
  }

  setType(type: string) {
    this.type = type;
    return this;
  }

  setSize(size: number) {
    this.size = size;
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
    return new FileModel(
      this.id,
      this.name,
      this.parent_directory,
      this.user,
      this.type,
      this.size,
      this.src,
      this.created,
      this.modified,
    );
  }
}

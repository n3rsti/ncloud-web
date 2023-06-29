# NcloudWeb

Cloud storage interface for (ncloud-api)[https://github.com/n3rsti/ncloud-api]

## Setup
### Install dependencies
`sudo npm install`

### Install angular cli
`sudo npm install -g @angular/cli`

## Features
### Basic features
This project has most of the features expected in file storage:
- upload / delete / rename / move files
- create / delete / rename / move directories
- display basic file details: 
    - name
    - date created
    - resolution (for images)
    - size
    - file type
- display file (for now supporting only images)
- recycle bin functionality: deleted files are put in recycle bin with option to either restore or permanently delete it
- search bar: searching for files and directories in real time
- file carousel (for now supporting only images)

*Disclaimer*: app is currently focused on desktop devices. UI is responsive for all devices, but some features might be still incomplete on mobile

### Keybinds
Keybinds for files and directories:
- `delete` / `F4` : move to recycle bin
- `shift` + `delete` / `shift` + `F4` : permanently delete
- `F2` : rename
- `F1` : show details

Other keybinds:
- `/` : open search bar

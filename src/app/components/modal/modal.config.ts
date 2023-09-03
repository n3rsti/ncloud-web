import { ModalConfig } from 'src/app/interfaces';

export let deleteModalConfig: ModalConfig = {
  subjectName: 'deleteItems',
  description: 'Do you want to move x items to trash?',
  title: 'Delete file',
  icon: 'warning',
  colors: {
    background: 'red-100',
    font: 'red-600',
  },
  fields: [
    {
      type: 'button',
      value: 'Delete',
      additionalData: { color: 'red-600', hover: 'red-700' },
    },
  ],
};

export let permanentlyDeleteModalConfig: ModalConfig = {
  subjectName: 'permanentlyDeleteItems',
  title: 'Permanently delete items',
  description: 'Do you want to permanently delete x items?',
  colors: {
    background: 'red-100',
    font: 'red-600',
  },
  fields: [
    {
      type: 'button',
      value: 'Delete',
      additionalData: { color: 'red-600', hover: 'red-700' },
    },
  ],
};

export let restoreModalConfig: ModalConfig = {
  subjectName: 'restoreItems',
  title: 'Restore items',
  description: 'Do you want to restore these x items?',
  icon: 'restore',
  colors: {
    background: 'green-100',
    font: 'green-500',
  },
  fields: [
    {
      type: 'button',
      value: 'Restore',
      additionalData: { color: 'green-400', hover: 'green-500' },
    },
  ],
};

export let renameFileModalConfig: ModalConfig = {
  subjectName: 'renameFile',
  title: 'Rename file',
  description: 'Do you want to rename the file?',
  icon: 'info',
  colors: {
    background: 'blue-100',
    font: 'blue-500',
  },
  fields: [
    {
      type: 'input-text',
      value: '',
      name: 'name',
    },
    {
      type: 'button',
      value: 'Rename',
      additionalData: { color: 'green-400', hover: 'green-500' },
    },
  ],
};

export let renameDirectoryModalConfig: ModalConfig = Object.create(
  renameFileModalConfig
);
renameDirectoryModalConfig.subjectName = 'renameDirectory';
renameDirectoryModalConfig.title = 'Rename Directory';
renameDirectoryModalConfig.description = 'Do you want to rename the directory?';

export let createDirectoryModalConfig: ModalConfig = {
  subjectName: 'createDirectory',
  title: 'New folder',
  colors: {
    background: 'indigo-100',
    font: 'indigo-600',
  },
  icon: 'plus',
  fields: [
    {
      type: 'input-text',
      value: '',
      name: 'name',
      additionalData: { placeholder: 'Example folder name...' },
    },
    {
      type: 'button',
      value: 'Create new folder',
      additionalData: { color: 'indigo-700', hover: 'indigo-800' },
    },
  ],
};

export let logoutModalConfig: ModalConfig = {
  subjectName: 'logout',
  title: 'Logout',
  description: 'Do you want to logout?',
  fields: [
    {
      type: 'button',
      value: 'Logout',
    },
  ],
};

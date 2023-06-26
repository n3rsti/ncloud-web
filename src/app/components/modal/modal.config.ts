import { ModalConfig } from "src/app/interfaces"

export let deleteModalConfig: ModalConfig = {
    subjectName: 'deleteItems',
    title: 'Delete file',
    fields: [
        {
            type: 'text',
            value: 'Do you want to move x items to trash?'
        },
        {
            type: 'button',
            value: 'Delete',
            additionalData: { "color": "red-600", "hover": "red-700" }
        }
    ]
}

export let permanentlyDeleteModalConfig: ModalConfig = {
    subjectName: 'permanentlyDeleteItems',
    title: 'Permanently delete items',
    fields: [
        {
            type: 'text',
            value: 'Do you want to permanently delete x items?'
        },
        {
            type: 'button',
            value: 'Delete',
            additionalData: { "color": "red-600", "hover": "red-700" }
        }
    ]
}

export let restoreModalConfig: ModalConfig = {
    subjectName: 'restoreItems',
    title: 'Restore items',
    fields: [
        {
            type: 'text',
            value: 'Do you want to restore these x items?'
        },
        {
            type: 'button',
            value: 'Restore',
            additionalData: { "color": "green-400", "hover": "green-500" }
        }
    ]
}

export let renameFileModalConfig: ModalConfig = {
    subjectName: 'renameFile',
    title: 'Rename file',
    fields: [
        {
            type: 'text',
            value: 'Do you want to rename the file?'
        },
        {
            type: 'input-text',
            value: '',
            name: 'name'
        },
        {
            type: 'button',
            value: 'Rename',
            additionalData: { "color": "green-400", "hover": "green-500" }
        }
    ]
}

export let renameDirectoryModalConfig: ModalConfig = Object.create(renameFileModalConfig)
renameDirectoryModalConfig.subjectName = 'renameDirectory';
renameDirectoryModalConfig.title = 'Rename Directory'
renameDirectoryModalConfig.fields[0].value = 'Do you want to rename the directory?';


export let createDirectoryModalConfig: ModalConfig = {
    subjectName: 'createDirectory',
    title: 'New folder',
    fields: [
        {
            type: 'input-text',
            value: '',
            name: 'name',
            additionalData: { "placeholder": "Example folder name..." }
        },
        {
            type: 'button',
            value: 'Create new folder',
            additionalData: { "color": "indigo-700", "hover": "indigo-800" }
        }
    ]
}
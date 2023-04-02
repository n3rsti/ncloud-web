# Modal
## Data flow
Modal component uses 2 **Subjects** to transfer data: **input**, **output**. 
They are both passed as component input.
One modal can be used more than once, and it will still use same 2 subjects.

### Input
```typescript
export interface ModalConfig {
  subjectName: string // unique
  title: string // displayed on top of modal
  fields: ModalField[]
  // unique identifier of object (e.g for file delete modal it would be file id)
  data?: string | number 
}

export interface ModalField {
  type: string // e.g text, input-text
  value: string | number
  name?: string;
  additionalData?: Record<string, string>
}
```

### ModalField
#### Fields
##### text
Paragraph of text (`value`)
##### input-text
Text input with `value`, **id** and **name** (`name`) from **ModalField**.
##### button
Submit button with text from `value` field and colors from `additionalData['color']`, `additionalData['hover']`

### Output
```typescript
export interface ModalOutput {
  subjectName: string
  value?: string | number
  formValues?: Record<string, any>;
}
```

Example of output from modal to delete file (id: 123)
```
{
  subjectName: "deleteFileModal",
  value: "123",
}
```

Example of output from modal to rename file (id: 123)
```
{
  subjectName: "renameFileModal",
  value: "123",
  formValues: {"name": "changedName"}
}
```

On modal submit, all `{name: value}` records from fields marked as `#modalInput` are collected and put into
output dictionary. If there are no inputs, `formValues` field isn't sent in output subject.

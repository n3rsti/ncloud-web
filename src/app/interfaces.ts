export interface ModalConfig {
  subjectName: string
  title: string
  fields: ModalField[]
  data?: string | number
}

export interface ModalField {
  type: string
  value: string | number
  name?: string;

  additionalData?: Record<string, string>
}

export interface ModalOutput {
  subjectName?: string
  value?: string | number
  formValues?: Record<string, any>;
}

export interface ModalColors {
  background: string;
  font: string;
}
export interface ModalConfig {
  subjectName: string;
  title: string;
  description?: string;
  icon?: string;
  colors?: ModalColors;
  fields: ModalField[];
  data?: string | number;
}

export interface ModalField {
  type: string;
  value: string | number;
  name?: string;
  additionalData?: Record<string, string>;
}

export interface ModalOutput {
  subjectName: string;
  value?: string | number;
  formValues?: Record<string, any>;
}

export interface ToastInput {
  message: string;
  icon: string;
}

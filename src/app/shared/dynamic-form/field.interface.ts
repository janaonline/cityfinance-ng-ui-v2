export interface Validator {
  name: string;
  validator: any;
  message: string;
}
export interface FieldConfig {
  label: string;
  name: string;
  key: string;
  formFieldType: string;
  tableRow?: any[];
  inputType: string;
  options?: string[];
  collections?: any;
  type: string;
  value?: any;
  validations?: Validator[];
  formArrays?: any[];
  uploading?: boolean;
}

export interface JsonFieldConfig {
  label: string;
  name?: string;
  inputType?: string;
  options?: string[];
  collections?: any;
  type: string;
  value?: any;
  validations?: Validator[];
  formArrays?: any[];
}
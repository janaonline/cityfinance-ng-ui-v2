export interface Table {
  id?: string;
  info?: string;
  endpoint?: string;
  response: TableResponse;
}

export interface TableResponse {
  success?: boolean;
  message?: string;
  name: string;
  // headerLink: {
  //   label: string;
  //   link: string;
  // }
  headerLink: HeaderLink;
  getEndpoint?: string;
  postEndpoint?: string;
  data: TableDataEntity[];
  lastRow: string[];
  total?: number;
  columns?: TableColumnsEntity[] | null;
  multipleSort?: boolean;
  subHeaders?: TableSubHeaders[]
}
export interface HeaderLink {
  label: string;
  link: string;
}
export interface TableSubHeaders {
  label: string;
  link: string;
  key: string;
}
export interface TableDataEntity {
  [key: string]: number | string | boolean;
}

export interface TableColumnsEntity {
  label: string;
  key: string;
  sort?: 0 | 1 | -1;
  sortable?: boolean;
  query?: string;
  hidden?: boolean;
  class?: string;
  pdfLink?: string;
  link?: string;
  colspan?: number;
}

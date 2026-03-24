export interface User {
  id: number;
  name: string;
  password: string;

}

export interface Employee {
  id: number;
  name: string;
  companny: string;
  password: string;
  admissionDate: Date;
}

export interface CreateEmployeeDTO {
  name: string;
  companny: string;
  password: string;
  admissionDate: string | Date;
}

export interface LoginDTO {
  name: string;
  password: string;
}

export interface SignUpDTO {
  name: string;
  password: string;
}

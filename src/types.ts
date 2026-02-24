export interface User {
  id: number;
  name: string;
  password: string;

}

export interface Employee {
  id: number;
  name: string;
  companny: number;
  password: string;
}

export interface CreateEmployeeDTO {
  name: string;
  companny: number;
  password: string;
}

export interface LoginDTO {
  name: string;
  password: string;
}

export interface SignUpDTO {
  name: string;
  password: string;
}

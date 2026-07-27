export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}

export interface ILoginUser {
  email: string;
  password: string;
}

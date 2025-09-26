export type RoleName = 'ADMINISTRADOR' | 'EVALUADOR' | 'RESPONSABLE_DE_AREA';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: RoleName;
}

export interface LoginResponse {
  access_token: string;
  user: UserDTO;
}

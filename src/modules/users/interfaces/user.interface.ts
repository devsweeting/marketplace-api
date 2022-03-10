import { RoleEnum } from '../enums/role.enum';

export interface UserResponse {
  id: string;
  refId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: RoleEnum;
}

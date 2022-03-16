import { Injectable } from '@nestjs/common';
import { UserResponse } from '../interfaces/user.interface';
import { User } from '../user.entity';

@Injectable()
export class UserTransformer {
  public transform(user: User): UserResponse {
    return {
      id: user.id,
      refId: user.refId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  public transformAllUsers(users: User[]): UserResponse[] {
    return users?.map((user) => this.transform(user));
  }
}

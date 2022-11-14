import { Injectable } from '@nestjs/common';
import { IUserResponse } from '../interfaces/user.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class UserTransformer {
  public transform(user: User): IUserResponse {
    return {
      id: user.id,
      refId: user.refId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  public transformAllUsers(users: User[]): IUserResponse[] {
    return users
      ?.map((user) => this.transform(user))
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }
}

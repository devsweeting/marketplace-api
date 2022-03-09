import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

import { BaseService } from '../common/services';
import { PasswordService } from '../auth/password.service';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';

@Injectable()
export class UsersService extends BaseService {
  public constructor(private readonly passwordService: PasswordService) {
    super();
  }

  public findAll(): Promise<User[]> {
    return User.find();
  }

  public async findOne(id: string): Promise<User> {
    const user = await User.findOne(id);
    if (user) {
      return user;
    }
    throw new UserNotFoundException();
  }

  async getByEmail(email: string): Promise<User> {
    const user = await User.findOne({ email });
    if (user) return user;
    throw new UserNotFoundException();
  }

  async checkByEmail(email: string): Promise<User> {
    const user = await User.findOne({ email });
    if (user) return user;

    return null;
  }

  async create(userData: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.encode(userData.password);
    const newUser = new User({ ...userData, password: hashedPassword });
    await newUser.save();
    return newUser;
  }

  public async update(id: string, userData: UpdateUserDto): Promise<User> {
    await User.update(id, userData);
    const updatedUser = await this.findOne(id);
    return updatedUser;
  }

  public async delete(id: string): Promise<void> {
    const user = await this.findOne(id);

    if (!user) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await user.remove();
  }
}

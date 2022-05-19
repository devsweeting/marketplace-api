import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

import { BaseService } from '../common/services';
import { PasswordService } from '../auth/password.service';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { CreateUserOtpDto } from './dto/create-user-otp.dto';

@Injectable()
export class UsersService extends BaseService {
  public constructor(private readonly passwordService: PasswordService) {
    super();
  }

  public findAll(): Promise<User[]> {
    return User.find({ where: { isDeleted: false } });
  }

  public async findOne(id: string): Promise<User> {
    const user = await User.findOne(id, { where: { isDeleted: false } });
    if (user) {
      return user;
    }
    throw new UserNotFoundException();
  }

  async getByEmail(email: string): Promise<User> {
    const user = await User.findOne({ where: { email, isDeleted: false } });
    if (user) return user;
    throw new UserNotFoundException();
  }

  async getByAddress(address: string): Promise<User> {
    const user = await User.findOne({ where: { address, isDeleted: false, deletedAt: null } });
    if (user) return user;
    throw new UserNotFoundException();
  }

  async checkByEmail(email: string): Promise<User> {
    const user = await User.findOne({ where: { email, isDeleted: false } });
    if (user) return user;

    return null;
  }

  async create(userData: CreateUserDto): Promise<User> {
    const nonce = this.passwordService.generateNonce();
    const newUser = new User({ ...userData, nonce });
    await newUser.save();
    return newUser;
  }

  async createOrUpdateFromOtp(userData: CreateUserOtpDto): Promise<User> {
    let user = await User.findOne({ where: { email: userData.email } });
    if (!user) {
      user = await User.create(userData);
      await user.save();
    }
    return user;
  }

  public async update(id: string, userData: UpdateUserDto): Promise<User> {
    await User.update(id, userData);
    const updatedUser = await this.findOne(id);
    return updatedUser;
  }

  public async updateNonce(user: User): Promise<string> {
    const nonce = this.passwordService.generateNonce();
    user.nonce = nonce;
    const updatedUser = await user.save();

    return updatedUser.nonce;
  }

  public async softDelete(id: string): Promise<void> {
    const user = await this.findOne(id);

    if (!user) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    Object.assign(user, { isDeleted: true, deletedAt: new Date() });
    await user.save();
  }
}

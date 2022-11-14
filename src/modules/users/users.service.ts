import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, CreateUserOtpDto } from './dto';

import { BaseService } from '../common/services';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';

@Injectable()
export class UsersService extends BaseService {
  public constructor() {
    super();
  }

  public findAll(): Promise<User[]> {
    return User.find({ where: { isDeleted: false } });
  }

  public async findOne(id: string): Promise<User> {
    const user = await User.findOne({ where: { id, isDeleted: false } });
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
    const nonce = this.generateNonce();
    const newUser = new User({ ...userData, nonce });
    await newUser.save();
    return newUser;
  }

  async createOrUpdateFromOtp(userData: CreateUserOtpDto): Promise<User> {
    let user = await User.findOne({ where: { email: userData.email }, loadEagerRelations: true });
    if (!user) {
      user = new User(userData);
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
    const nonce = this.generateNonce();
    user.nonce = nonce;
    const updatedUser = await user.save();

    return updatedUser.nonce;
  }

  public generateNonce(): string {
    // eslint-disable-next-line no-magic-numbers
    return String(Math.floor(Math.random() * 1000000));
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

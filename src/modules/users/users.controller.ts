import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponse } from './interfaces/user.interface';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserTransformer } from './transformers/user.transformer';
import { LocalAuthGuard } from 'modules/auth/guards/local-auth.guard';
import { AuthService } from 'modules/auth/auth.service';
import RequestWithUser from 'modules/auth/interfaces/request-with-user.interface';
import JwtAuthGuard from 'modules/auth/guards/jwt-auth.guard';
import RoleGuard from 'modules/auth/guards/role.guard';
import { RoleEnum } from './enums/role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private readonly usersService: UsersService,
    private readonly userTransformer: UserTransformer,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  public async login(@Req() request: RequestWithUser): Promise<string> {
    return this.authService.generateToken(request.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The found records',
    type: User,
  })
  public async getUsers(): Promise<UserResponse[]> {
    const users = await this.usersService.findAll();
    return this.userTransformer.transformAllUsers(users);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @ApiNotFoundResponse()
  public async getUser(@Param('id') id): Promise<UserResponse> {
    const user = await this.usersService.findOne(id);
    return this.userTransformer.transform(user);
  }

  @Post()
  @UseGuards(RoleGuard([RoleEnum.SUPER_ADMIN]))
  @HttpCode(201)
  @ApiOperation({ summary: 'Create user' })
  public async create(@Body() userData: CreateUserDto): Promise<UserResponse> {
    const user = await this.usersService.create(userData);
    return this.userTransformer.transform(user);
  }

  @Patch(':id')
  @UseGuards(RoleGuard([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN]))
  @HttpCode(200)
  @ApiOperation({ summary: 'Update user' })
  @ApiNotFoundResponse()
  public async update(@Param('id') id, @Body() userData: UpdateUserDto): Promise<UserResponse> {
    const user = await this.usersService.update(id, userData);
    return this.userTransformer.transform(user);
  }

  @Delete(':id')
  @UseGuards(RoleGuard([RoleEnum.SUPER_ADMIN]))
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiNotFoundResponse()
  public async delete(@Param('id') id): Promise<void> {
    return this.usersService.softDelete(id);
  }
}

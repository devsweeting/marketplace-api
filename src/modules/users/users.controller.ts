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
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponse } from './interfaces/user.interface';
import { CreateUserDto, LoginConfirmDto, LoginRequestDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserTransformer } from './transformers/user.transformer';
import { AuthService } from 'modules/auth/auth.service';
import JwtAuthGuard from 'modules/auth/guards/jwt-auth.guard';
import RoleGuard from 'modules/auth/guards/role.guard';
import { RoleEnum } from './enums/role.enum';
import { OtpService } from './services/otp.service';
import { RefreshRequestDto } from './dto/refresh-request.dto';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTransformer: UserTransformer,
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Get(':address/nonce')
  public async getUserNonce(@Param('address') address): Promise<string> {
    const user = await this.usersService.getByAddress(address);
    return user.nonce ? user.nonce : await this.usersService.updateNonce(user);
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

  @Post('login/request')
  @ApiOperation({ summary: 'Send OTP token via email.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email was sent.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
  })
  @HttpCode(HttpStatus.OK)
  public async loginRequest(@Body() dto: LoginRequestDto) {
    await this.otpService.sendOtpToken(dto);

    return {
      status: 200,
      description: 'Email was sent.',
    };
  }

  @Post('login/confirm')
  @ApiOperation({ summary: 'Confirm OTP token.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid.',
  })
  @ApiBadRequestResponse({ description: 'Token is invalid.' })
  @HttpCode(HttpStatus.OK)
  public async loginConfirm(@Body() dto: LoginConfirmDto) {
    const returnResponse = await this.otpService.confirmUserLogin(dto);
    return returnResponse;
  }

  //we don't have a log out method

  @Post('login/refresh')
  // @UseGuards(JwtRefreshTokenGuard)
  @ApiOperation({ summary: 'Create a new access token using the users refresh token' })
  @ApiBadRequestResponse({ description: 'Refresh token is invalid.' })
  @HttpCode(HttpStatus.OK)
  public async refreshLogin(@Body() dto: RefreshRequestDto) {
    console.log('login/refresh', dto);
    const { user, accessToken } = await this.authService.createNewAccessTokensFromRefreshToken(
      dto.refreshToken,
    );
    // console.log('user returned', user);
    return { user, accessToken };
  }
}

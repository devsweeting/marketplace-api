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
import { IUserResponse } from './interfaces/user.interface';
import { CreateUserDto, LoginConfirmDto, LoginRequestDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserTransformer } from './transformers/user.transformer';
import JwtAuthGuard from 'modules/auth/guards/jwt-auth.guard';
import RoleGuard from 'modules/auth/guards/role.guard';
import { RoleEnum } from './enums/role.enum';
import { OtpService } from './services/otp.service';
import { RefreshRequestDto } from './dto/refresh-request.dto';
import { JwtRefreshGaurd } from 'modules/auth/guards/jwt-refresh.guard';
import { AuthService } from 'modules/auth/auth.service';
import { StatusCodes } from 'http-status-codes';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTransformer: UserTransformer,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
  ) {}

  @Get(':address/nonce')
  public async getUserNonce(@Param('address') address: string): Promise<string> {
    const user = await this.usersService.getByAddress(address);
    return user.nonce ? user.nonce : await this.usersService.updateNonce(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: StatusCodes.OK,
    description: 'The found records',
    type: User,
  })
  public async getUsers(): Promise<IUserResponse[]> {
    const users = await this.usersService.findAll();
    return this.userTransformer.transformAllUsers(users);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: StatusCodes.OK,
    description: 'The found record',
  })
  @ApiNotFoundResponse()
  public async getUser(@Param('id') id: string): Promise<IUserResponse> {
    const user = await this.usersService.findOne(id);
    return this.userTransformer.transform(user);
  }

  @Post()
  @UseGuards(RoleGuard([RoleEnum.SUPER_ADMIN]))
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create user' })
  public async create(@Body() userData: CreateUserDto): Promise<IUserResponse> {
    const user = await this.usersService.create(userData);
    return this.userTransformer.transform(user);
  }

  @Patch(':id')
  @UseGuards(RoleGuard([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN]))
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update user' })
  @ApiNotFoundResponse()
  public async update(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.usersService.update(id, userData);
    return this.userTransformer.transform(user);
  }

  @Delete(':id')
  @UseGuards(RoleGuard([RoleEnum.SUPER_ADMIN]))
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiNotFoundResponse()
  public async delete(@Param('id') id: string): Promise<void> {
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
  public async loginRequest(
    @Body() dto: LoginRequestDto,
  ): Promise<{ status: StatusCodes; description: string }> {
    await this.otpService.sendOtpToken(dto);

    return {
      status: StatusCodes.OK,
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
  public async loginConfirm(
    @Body() dto: LoginConfirmDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const returnResponse = await this.otpService.confirmUserLogin(dto);
    return returnResponse;
  }

  @Post('login/refresh')
  @UseGuards(JwtRefreshGaurd)
  @ApiOperation({ summary: 'Create a new access token using the users refresh token' })
  @ApiBadRequestResponse({ description: 'Refresh token is invalid.' })
  @HttpCode(HttpStatus.OK)
  public async refreshLogin(
    @Body() dto: RefreshRequestDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await this.authService.createNewAccessTokensFromRefreshToken(dto.refreshToken);
    return response;
  }
}

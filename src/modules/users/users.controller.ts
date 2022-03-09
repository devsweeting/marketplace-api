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
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBasicAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponse } from './interfaces/user.interface';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserTransformer } from './transformers/user.transformer';

@ApiTags('users')
@Controller('users')
@ApiBasicAuth('api-key')
@UseGuards(AuthGuard('headerapikey'))
export class UsersController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private readonly usersService: UsersService,
    private readonly userTransformer: UserTransformer,
  ) {}

  @Get('/')
  @ApiResponse({
    status: 200,
    description: 'The found records',
    type: User,
  })
  public async getUsers(): Promise<UserResponse[]> {
    return await this.usersService.findAll();
  }

  @Get('/:id')
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
  @HttpCode(201)
  @ApiOperation({ summary: 'Create user' })
  public async create(@Body() userData: CreateUserDto): Promise<UserResponse> {
    const user = await this.usersService.create(userData);
    return this.userTransformer.transform(user);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update user' })
  @ApiNotFoundResponse()
  public async update(@Param('id') id, @Body() userData: UpdateUserDto): Promise<UserResponse> {
    const user = await this.usersService.update(id, userData);
    return this.userTransformer.transform(user);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiNotFoundResponse()
  public async delete(@Param('id') id): Promise<void> {
    return this.usersService.delete(id);
  }
}

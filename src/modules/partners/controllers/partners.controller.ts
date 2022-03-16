import { Controller, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('partners')
@Controller('partners')
@ApiBasicAuth('api-key')
@UseGuards(AuthGuard('headerapikey'))
export class PartnersController {}

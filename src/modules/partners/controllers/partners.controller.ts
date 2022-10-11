import { Body, Controller, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetPartner } from 'modules/auth/decorators/get-partner.decorator';
import { Partner } from '../entities';
import { PartnersService } from '../services/partners.service';
import { UpdatePartnerMembersDto } from '../dto';
import { StatusCodes } from 'http-status-codes';

@ApiTags('partners')
@Controller({
  path: 'partners',
  version: '1',
})
@ApiBasicAuth('api-key')
@UseGuards(AuthGuard('headerapikey'))
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Patch()
  @ApiOperation({ summary: 'Update a partner' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner updated',
  })
  @ApiNotFoundResponse({
    description: 'Partner not found',
  })
  @HttpCode(HttpStatus.OK)
  public async update(@GetPartner() partner: Partner, @Body() dto: UpdatePartnerMembersDto) {
    await this.partnersService.updatePartnerMembers(partner, dto);

    return {
      status: StatusCodes.OK,
      description: 'Partner updated',
    };
  }
}

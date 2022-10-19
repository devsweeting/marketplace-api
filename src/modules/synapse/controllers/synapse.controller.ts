import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { SynapseService } from '../providers/synapse.service';

@ApiTags('synapse')
@Controller({
  path: 'synapse',
  version: '1',
})
export class SynapseController {
  constructor(private readonly synapseService: SynapseService) {}

  @Get('users')
  public async getAllSynapseUsers() {
    const nodeUsers = await this.synapseService.getAllUsers();
    return nodeUsers;
  }

  @Post('address')
  //by default all nest post request return 201
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifies an address is deliverable' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  //TODO - add @authGuard
  public async verifyAddress(@Body() dto: VerifyAddressDto) {
    // //Development only
    // dto = {
    //   address_street: '170 St Germain St',
    //   address_city: 'SF',
    //   address_subdivision: 'CA',
    //   address_country_code: 'US',
    //   address_postal_code: '94404',
    // };
    const address = await this.synapseService.verifyAddress(dto);
    return {
      status: HttpStatus.OK,
      address,
    };
  }
}

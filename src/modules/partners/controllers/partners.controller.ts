import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResultsDto } from '../../common/dto/results.dto';
import { TransferRequestDto } from '../dto/transfer-request.dto';
import { PartnersService } from '../services/partners.service';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private readonly partnersService: PartnersService) {}

  @Post('assets')
  @ApiOperation({ summary: 'Move a partner asset to the blockchain' })
  @ApiResponse({
    status: 201,
    description: 'Transfer request accepted, processing.',
  })
  async transfer(@Param() params, @Body() txreq: TransferRequestDto): Promise<ResultsDto> {
    return new Promise<ResultsDto>(async (resolve, reject) => {
      const partner = await this.partnersService.findOneById(params.id);
      console.log(partner);
      console.log(txreq);
      resolve({ statusCode: 201, message: 'CREATED' });
    });
  }
}

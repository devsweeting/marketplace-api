import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResultsDto } from '../dto/results.dto';
import { TransferRequestDto } from '../dto/transfer-request.dto';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  @Post('/assets')
  @ApiOperation({ summary: 'Move a partner asset to the blockchain' })
  @ApiResponse({
    status: 201,
    description: 'Transfer request accepted, processing.',
  })
  transfer(@Body() txreq: TransferRequestDto): ResultsDto {
    console.log(txreq);
    return { statusCode: 201, message: 'CREATED' };
  }
}

import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetResponse } from 'modules/assets/interfaces/response/asset.response';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { generateSwaggerPaginatedSchema } from 'modules/common/helpers/generate-swagger-paginated-schema';
import { EventsTransformer } from './transformers/events.transformer';
import { EventsService } from './events.service';
import { EventRequestDto, ListEventsDto } from './dto';
import { EventResponse } from './interfaces/response/event.response';
import { EventIdDto } from './dto/event-id.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly eventsTransformer: EventsTransformer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Return list of events' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of events',
    schema: generateSwaggerPaginatedSchema(EventResponse),
  })
  public async list(@Query() params: ListEventsDto): Promise<PaginatedResponse<EventResponse>> {
    const list = await this.eventsService.getList(params);

    return this.eventsTransformer.transformPaginated(list);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns single event' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'An events',
    type: AssetResponse,
  })
  public async getOne(@Param() params: EventIdDto): Promise<EventResponse> {
    const event = await this.eventsService.getOne(params.id);

    return this.eventsTransformer.transform(event);
  }

  @Post()
  @ApiOperation({ summary: 'Create asset event' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event request created',
  })
  public async create(@Param() assetId: string, @Body() dto: EventRequestDto) {
    await this.eventsService.recordEventRequest(assetId, dto);

    return {
      status: 201,
      description: 'Event request created',
    };
  }
}

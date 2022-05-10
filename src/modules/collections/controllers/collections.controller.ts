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
  Query,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CollectionsService } from '../collections.service';
import { CollectionDto } from '../dto/collection.dto';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { generateSwaggerPaginatedSchema } from 'modules/common/helpers/generate-swagger-paginated-schema';
import { CollectionResponse } from '../interfaces/responses/collection.response';
import { CollectionIdDto, CollectionIdOrSlugDto, ListCollectionsDto } from '../dto';
import { CollectionsTransformer } from '../transformers/collections.transformer';
import { UpdateCollectionDto } from '../dto/update-collection.dto';
import { validate as isValidUUID } from 'uuid';

@ApiTags('collections')
@Controller({
  path: 'collections',
  version: '1',
})
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly collectionsTransformer: CollectionsTransformer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Return list of collections' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of collections',
    schema: generateSwaggerPaginatedSchema(CollectionResponse),
  })
  public async list(
    @Query() params: ListCollectionsDto,
  ): Promise<PaginatedResponse<CollectionResponse>> {
    const list = await this.collectionsService.getList(params);
    return this.collectionsTransformer.transformPaginated(list);
  }

  @Get(':collectionParams')
  @ApiOperation({ summary: 'Returns single collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A collection',
    type: CollectionResponse,
  })
  public async getOne(@Param() params: CollectionIdOrSlugDto): Promise<CollectionResponse> {
    let asset;
    if (isValidUUID(params.collectionParams)) {
      asset = await this.collectionsService.getOne({ id: params.collectionParams, slug: null });
    } else {
      asset = await this.collectionsService.getOne({ id: null, slug: params.collectionParams });
    }
    return this.collectionsTransformer.transform(asset);
  }

  @Post()
  @ApiOperation({ summary: 'Create a collection' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Collection created',
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() dto: CollectionDto) {
    await this.collectionsService.createCollection(dto);

    return {
      status: 201,
      description: 'Collection created',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Collection updated',
  })
  @ApiNotFoundResponse({
    description: 'Collection not found',
  })
  @HttpCode(HttpStatus.OK)
  public async update(@Param() params: CollectionIdDto, @Body() dto: UpdateCollectionDto) {
    const collection = await this.collectionsService.updateCollection(params.id, dto);

    return this.collectionsTransformer.transform(collection);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a collection' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Collection deleted',
  })
  @ApiNotFoundResponse({
    description: 'Collection not found',
  })
  public async delete(@Param() params: CollectionIdDto): Promise<void> {
    await this.collectionsService.deleteCollection(params.id);
  }
}

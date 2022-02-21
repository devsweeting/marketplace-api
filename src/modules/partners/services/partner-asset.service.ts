import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Connection, FindManyOptions, FindOneOptions, Not } from 'typeorm';
import { BaseService } from 'modules/common/services';
import { Asset } from '../entities/asset.entity';
import { AssetRepository } from '../repositories/asset.repository';
import {
    TransferRequestDto,
} from '../dto';
import { User } from 'modules/users/entities';

@Injectable()
export class PartnerAssetService extends BaseService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly connection: Connection,
  ) {
    super();
  }

  public async findAllPagination(
    args: AssetArgs,
    currentUser: User,
  ): Promise<[Asset[], number]> {
    const AssetArgs = { ...args };
    return await this.assetRepository.findAndCountByOptions(AssetArgs);
  }

  /**
   * Get asset by id
   *
   * @param id: number
   * @param currentUser: User
   * @returns Promise<AssetResponseDto>
   */
  public async findOneById(id: string): Promise<AssetResponseDto> {
    const asset: Asset = await this.assetRepository.findOneById(id);

    if (!asset) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return <AssetResponseDto>asset;
  }

  public async find(options: FindManyOptions<Asset>): Promise<Asset[]> {
    const actions: Asset[] = await this.assetRepository.find(options);

    return actions;
  }

  public async findOne(options: FindOneOptions<Asset>): Promise<Asset> {
    const asset: Asset = await this.assetRepository.findOne(options);

    return asset;
  }

  /**
   * Search if exist other Asset with the same name. Asset should be different to given Asset ID.
   *
   * @param name name to search
   * @param AssetId ID of existing Asset
   */
  public async findOneEqualName(data: AssetDto): Promise<Asset> {
    return this.assetRepository.findOne({
      id: Not(data.id),
      name: data.name,
    });
  }

  public async create(data: AssetCreationDto): Promise<Asset> {
    const asset = await this.assetRepository.save(
      this.assetRepository.create(data),
    );

    return asset;
  }

  public async save(data: AssetDto): Promise<Asset> {
    // if (await this.findOneEqualName(data)) {
    //   throw new HttpException('Name already exists', HttpStatus.BAD_REQUEST);
    // }

    return this.assetRepository.save(data);
  }

  public async remove(id: string) {
    await this.assetRepository.delete(id);
    return { id };
  }

  public async insertMany(data: AssetCreationDto[]): Promise<Asset[]> {
    // It should process the data to generate the slug value by asset
    const processedData: Asset[] = [];
    data.forEach((assetInput) => {
      const newAsset = new Asset(assetInput);
      newAsset.beforeInsert();
      processedData.push(newAsset);
    });
    const result = await this.assetRepository.save(processedData);
    return await this.assetRepository.findByIds(
      result.map((asset) => {
        return asset.id;
      }),
    );
  }

  public async saveMany(data: AssetDto[]): Promise<Asset[]> {
    // It should process the data to generate the slug value by asset
    const processedData: Asset[] = [];
    data.forEach((assetInput) => {
      const newAsset = new Asset(assetInput);
      newAsset.beforeUpdate();
      processedData.push(newAsset);
    });
    const result = await this.assetRepository.save(data);
    return await this.assetRepository.findByIds(
      result.map((asset) => {
        return asset.id;
      }),
    );
  }
}

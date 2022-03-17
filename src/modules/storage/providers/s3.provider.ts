import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Provider {
  public constructor(private readonly configService: ConfigService) {}
}

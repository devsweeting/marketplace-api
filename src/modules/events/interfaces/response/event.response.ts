import { ApiProperty } from '@nestjs/swagger';
import { EventTypeEnum } from 'modules/events/enums/event-type.enum';
import { PaymentTokenEnum } from 'modules/events/enums/payment-token.enum';

export class EventResponse {
  @ApiProperty()
  public id: string;

  @ApiProperty({ example: PaymentTokenEnum.DAI })
  public paymentToken: PaymentTokenEnum;

  @ApiProperty({ example: EventTypeEnum.Created })
  public eventType: EventTypeEnum;

  @ApiProperty({ example: 1 })
  public quantity: number;

  @ApiProperty({ example: 1 })
  public totalPrice: number;

  @ApiProperty({ example: '1' })
  public isPrivate: boolean;

  @ApiProperty()
  public assetId: string;

  @ApiProperty({ example: '2022-03-09T09:05:34.176Z' })
  public updatedAt: string;

  @ApiProperty({ example: '2022-03-09T09:05:34.176Z' })
  public createdAt: string;
}

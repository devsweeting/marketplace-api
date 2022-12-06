import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'modules/users/entities';
import { UserPaymentsAccount } from '../entities/user-payments-account.entity';
import { ISynapseAccountResponse } from '../interfaces/synapse-node';
export class UserPaymentAccountData {
  @ApiProperty({ type: User })
  public user: User;

  @ApiProperty({ type: Object })
  public account: ISynapseAccountResponse;
}

export class UserPaymentAccountResponse {
  @ApiProperty({ example: HttpStatus.OK })
  public status: HttpStatus;

  @ApiProperty({ type: UserPaymentAccountData })
  public data: UserPaymentAccountData;
}

export class PaymentsAccountResponse {
  @ApiProperty({ example: HttpStatus.CREATED })
  status: HttpStatus;
  @ApiProperty({ example: '' })
  msg: string;
  @ApiProperty({ type: UserPaymentsAccount })
  account: UserPaymentsAccount;
}

export class UpdatePaymentsAccountResponse {
  @ApiProperty({ example: HttpStatus.OK })
  status: HttpStatus;
  @ApiProperty({ example: 'Payments account updated for user' })
  msg: string;
}

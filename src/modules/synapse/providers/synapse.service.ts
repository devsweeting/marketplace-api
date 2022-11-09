/* eslint-disable no-console */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { StatusCodes } from 'http-status-codes';
import { BaseService } from 'modules/common/services';
import { User } from 'modules/users/entities';
import { Client } from 'synapsenode';
import { CreateAccountDto } from '../dto/create-account.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { UserSynapse } from '../entities/user-synapse.entity';
import { SynapseAccountCreationFailed } from '../exceptions/account-creation-failure.exception';
import { AddressVerificationFailedException } from '../exceptions/address-verification-failed.exception';
import { UserSynapseAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import {
  ErrorResponse,
  IPermissions,
  IAddressResponse,
  IUserPaymentAccountResponse,
  IUserSynapseAccountResponse,
} from '../interfaces/create-account';
// import { synapseSavedUserCreatedResponse } from '../test-variables';
import { createUserParams } from '../util/helper';

// const IS_DEVELOPMENT = process.env.NODE_ENV === 'DEVELOP';

@Injectable()
export class SynapseService extends BaseService {
  public constructor(private readonly configService: ConfigService) {
    super();
  }
  client = new Client({
    client_id: this.configService.get('synapse.default.clientId'),
    client_secret: this.configService.get('synapse.default.clientSecret'),
    fingerprint: this.configService.get('synapse.default.fingerprint'),
    ip_address: this.configService.get('synapse.default.ipAddress'), //TODO - Update to pass the IP address of user for fraud detection
    isProduction: this.configService.get('synapse.default.isProduction'),
  });

  private async getUserSynapseAccount(userId: string): Promise<User> {
    const userSynapseAccount = await User.createQueryBuilder('users')
      .leftJoinAndMapOne('users.synapseAccount', 'users.synapseAccount', 'userSynapse')
      .where('userSynapse.userId = :userId', { userId: userId })
      .getOne();

    return userSynapseAccount;
  }

  public async verifyAddress(dto: VerifyAddressDto): Promise<IAddressResponse> {
    const response = this.client
      .verifyAddress({
        address_city: dto.address_city,
        address_country_code: dto.address_country_code,
        address_postal_code: dto.address_postal_code,
        address_street: dto.address_street,
        address_subdivision: dto.address_subdivision,
      })
      .then(({ data }) => {
        return data;
      })
      .catch((error) => {
        if (error) {
          throw new AddressVerificationFailedException();
        }
      });
    return response;
  }

  public async getSynapseUserDetails(
    user: User,
  ): Promise<IUserPaymentAccountResponse | ErrorResponse> {
    //Check if user has an associated payment account
    const userPaymentAccount = await this.getUserSynapseAccount(user.id);

    if (userPaymentAccount === null) {
      return new UserSynapseAccountNotFound(
        `There is no saved payments account associated with the user ID -- ${user.id}`,
      ).getResponse();
    }
    const synapseId = userPaymentAccount.synapseAccount.userSynapseId;

    //Query Synapse API for full account details
    const paymentAccountDetail = await this.client
      .getUser(synapseId, null)
      .then(({ body }) => {
        return body;
      })
      .catch(({ response }) => {
        return response.status === StatusCodes.NOT_FOUND
          ? new UserSynapseAccountNotFound(
              `Cannot locate a synapse FBO payments account with synapse_user ID -- ${synapseId}`,
            ).getResponse()
          : response;
      });

    return {
      status: HttpStatus.OK,
      data: { user: userPaymentAccount, account: paymentAccountDetail },
    };
  }

  public async createSynapseUserAccount(
    bodyParams: CreateAccountDto,
    user: User,
    ip_address: Ipv4Address,
  ): Promise<IUserSynapseAccountResponse> {
    //Check if the user already has an associated payments account
    const userSynapseAccount = await this.getUserSynapseAccount(user.id);

    if (userSynapseAccount) {
      return {
        status: HttpStatus.SEE_OTHER,
        msg: `Synapse account already exists for user -- ${user.id}`,
        account: userSynapseAccount.synapseAccount,
      };
    }

    //Generate params to create new payments account;
    const accountUserParams = createUserParams(user.id, bodyParams, ip_address);

    //Create new FBO payments account with Synapse
    const newAccount = await this.client
      .createUser(accountUserParams, ip_address, {})
      .then((data) => {
        return data.body;
      })
      .catch((err) => {
        if (err) {
          throw new SynapseAccountCreationFailed(err.response.data);
        }
      });

    //Associate the new payment FBO details with the user:
    const createdSynapseAccount = await UserSynapse.create({
      userId: user.id,
      userSynapseId: newAccount._id,
      depositNodeId: null,
      refreshToken: newAccount.refresh_token,
      permission: newAccount.permission as IPermissions,
      permission_code: newAccount.permission_code,
    }).save();

    Logger.log(
      `Synapse FBO account(${createdSynapseAccount.userSynapseId}) successfully created for user -- ${user.id}`,
    );

    return {
      status: HttpStatus.CREATED,
      msg: `Synapse account created for user -- ${user.id}`,
      account: createdSynapseAccount,
    };
  }
}

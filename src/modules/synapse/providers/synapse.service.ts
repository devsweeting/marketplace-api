/* eslint-disable no-console */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { BaseService } from 'modules/common/services';
import { User } from 'modules/users/entities';
import { Client } from 'synapsenode';
import { CreateAccountDto } from '../dto/create-account.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { UserSynapse } from '../entities/user-synapse.entity';
import { AddressVerificationFailedException } from '../exceptions/address-verification-failed.exception';
import { UserSynapseAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import { IPermissions, IUserSynapseAccountResponse } from '../interfaces/create-account';
import { synapseSavedUserCreatedResponse } from '../test-variables';
import { createUserParams } from '../util/helper';

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

  public async verifyAddress(dto: VerifyAddressDto): Promise<any> {
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

  public async getSynapseUserDetails(synapse_id: string): Promise<any> {
    const synapseUser = await this.client
      .getUser(synapse_id, null)
      .then((data) => {
        return {
          accountExists: true,
          userData: data.body,
        };
      })
      .catch(() => {
        return {
          accountExists: false,
          userData: new UserSynapseAccountNotFound(
            `Cannot locate synapse user account with userId -- ${synapse_id}`,
          ).getResponse(),
        };
      });
    return synapseUser;
  }

  public async createSynapseUserAccount(
    bodyParams: CreateAccountDto,
    user: User,
    ip_address: Ipv4Address,
  ): Promise<IUserSynapseAccountResponse> {
    //Step 1 ->  Check if the user already has an associated synapse account
    const userSynapseAccount = await User.createQueryBuilder('users')
      .leftJoinAndMapMany('users.synapseAccount', 'users.synapseAccount', 'userSynapse')
      .where('userSynapse.userId = :userId', { userId: user.id })
      .getOne();

    if (userSynapseAccount) {
      console.log('USER SYNAPSE ACCOUNT ALREADY EXISTS', userSynapseAccount);
      return {
        status: HttpStatus.SEE_OTHER,
        msg: `Synapse account already exists for user -- ${user.id}`,
        account: userSynapseAccount.synapseAccount,
      };
    }

    // Step 2 -> Generate synapse account params;
    const accountUserParams = createUserParams(user.id, bodyParams, ip_address);

    // Step 3 -> Create new user synapse account.
    const newAccount = accountUserParams && synapseSavedUserCreatedResponse.User; //DEVELOPMENT - return a saved JSON response
    // const newAccount = await this.client
    // .createUser(accountUserParams, ip_address, {})
    // .then((data) => {
    //   return data;
    // })
    // .catch((err) => {
    //   if (err) {
    //     throw new SynapseAccountCreationFailed(err.response.data);
    //   }
    // });
    // console.log('newAccount', newAccount);

    // Step 4 ->  If a user synapse account does not exist, create one:
    const createdSynapseAccount = await UserSynapse.create({
      userId: user.id,
      userSynapseId: newAccount.id,
      depositNodeId: null,
      refreshToken: newAccount.body.refresh_token,
      permission: newAccount.body.permission as IPermissions,
      permission_code: newAccount.body.permission_code,
    }).save();

    return {
      status: HttpStatus.CREATED,
      msg: `Synapse account created for user -- ${user.id}`,
      account: createdSynapseAccount,
    };
  }
}

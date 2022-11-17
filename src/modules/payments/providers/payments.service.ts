/* eslint-disable no-console */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { StatusCodes } from 'http-status-codes';
import { BaseService } from 'modules/common/services';
import { User } from 'modules/users/entities';
import { Client } from 'synapsenode';
import { BasicKycDto } from '../dto/basic-kyc.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { UserPaymentsAccount } from '../entities/user-payments-account.entity';
import { PaymentsAccountCreationFailed } from '../exceptions/account-creation-failure.exception';
import { AddressVerificationFailedException } from '../exceptions/address-verification-failed.exception';
import { UserPaymentsAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import {
  IPermissions,
  IAddressResponse,
  IUserPaymentAccountResponse,
  IPaymentsAccountResponse,
} from '../interfaces/create-account';
import { createSubnet, getOAuthKey, initializeUserClient } from '../util/helper';
import { createUserParams } from '../util/kyc-helpers';

@Injectable()
export class PaymentsService extends BaseService {
  public constructor(private readonly configService: ConfigService) {
    super();
  }
  client = new Client({
    client_id: this.configService.get('payments.default.clientId'),
    client_secret: this.configService.get('payments.default.clientSecret'),
    fingerprint: this.configService.get('payments.default.fingerprint'),
    ip_address: this.configService.get('payments.default.ipAddress'), //TODO - Update to pass the IP address of user for fraud detection
    isProduction: this.configService.get('payments.default.isProduction'),
  });

  private async getUserPaymentsAccount(userId: string): Promise<User> {
    const userPaymentsAccount = await User.createQueryBuilder('users')
      .leftJoinAndMapOne('users.paymentsAccount', 'users.paymentsAccount', 'userPaymentsAccount')
      .where('userPaymentsAccount.userId = :userId', { userId: userId })
      .getOne();

    return userPaymentsAccount;
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

  public async getPaymentAccountDetails(user: User): Promise<IUserPaymentAccountResponse> {
    //Check if user has an associated payment account
    const paymentAccount = await this.getUserPaymentsAccount(user.id);

    if (paymentAccount === null) {
      throw new UserPaymentsAccountNotFound(
        `There is no saved payments account associated with the user ID -- ${user.id}`,
      );
    }
    const accountId = paymentAccount.paymentsAccount.userAccountId;

    //Query Synapse API for full account details
    const paymentAccountDetail = await this.client
      .getUser(accountId, null)
      .then(({ body }) => {
        return body;
      })
      .catch(({ response }) => {
        if (response.status === StatusCodes.NOT_FOUND) {
          throw new UserPaymentsAccountNotFound(
            `Cannot locate a FBO payments account with account ID -- ${accountId}`,
          );
        }
        return response;
      });

    return {
      status: HttpStatus.OK,
      data: { user: paymentAccount, account: paymentAccountDetail },
    };
  }

  public async submitKYC(
    bodyParams: BasicKycDto,
    user: User,
    ip_address: Ipv4Address,
  ): Promise<IPaymentsAccountResponse> {
    //Check if the user already has an associated payments account
    const userPaymentsAccount = await this.getUserPaymentsAccount(user.id);

    if (userPaymentsAccount) {
      return {
        status: HttpStatus.SEE_OTHER,
        msg: `Payments account already exists for user -- ${user.id}`,
        account: userPaymentsAccount.paymentsAccount,
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
          console.log(err.response);
          throw new PaymentsAccountCreationFailed(err.response.data);
        }
      });

    //Associate the new payment FBO details with the user:
    const newPaymentsAccount = await UserPaymentsAccount.create({
      userId: user.id,
      userAccountId: newAccount._id,
      depositNodeId: null,
      refreshToken: newAccount.refresh_token,
      permission: newAccount.permission as IPermissions,
      permissionCode: newAccount.permission_code,
      oauthKey: newAccount.oauth_key, //TODO check and verify in tests
    }).save();

    Logger.log(
      `FBO payments account(${newPaymentsAccount.userAccountId}) successfully created for user -- ${user.id}`,
    );

    return {
      status: HttpStatus.CREATED,
      msg: `Payments account created for user -- ${user.id}`,
      account: newPaymentsAccount,
    };
  }

  public async createPaymentSubnet(user: User, headers: object, ip_address: string): Promise<any> {
    const paymentAccount = await this.getUserPaymentsAccount(user.id);
    const { refreshToken, userAccountId } = paymentAccount.paymentsAccount;

    const userClient = initializeUserClient(userAccountId, headers, ip_address, this.client);

    const { oauth_key } = await getOAuthKey(userClient, refreshToken);

    const node = await createSubnet(oauth_key);
    console.log('node', node);
    return HttpStatus.I_AM_A_TEAPOT;
  }
}

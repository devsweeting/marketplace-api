import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { httpstatus } from 'aws-sdk/clients/glacier';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { BaseService } from 'modules/common/services';
import { User } from 'modules/users/entities';
import { Client } from 'synapsenode';
import { User as PaymentsUser } from 'synapsenode';
import { BasicKycDto } from '../dto/basic-kyc.dto';
import { UpdateKycDto } from '../dto/update-kyc.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { UserPaymentsAccount } from '../entities/user-payments-account.entity';
import { PaymentsAccountCreationFailed } from '../exceptions/account-creation-failure.exception';
import { AccountPatchError } from '../exceptions/account-patch-failure.exception';
import { AddressVerificationFailedException } from '../exceptions/address-verification-failed.exception';
import { BaseDocumentError } from '../exceptions/base-document-error-exception';
import { UserPaymentsAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import {
  IPermissions,
  IAddressResponse,
  IUserPaymentAccountResponse,
  IPaymentsAccountResponse,
} from '../interfaces/create-account';
import { ISynapseBaseDocuments } from '../interfaces/synapse-node';
import {
  createDepositNode,
  createUserParams,
  getOAuthKey,
  getUserPaymentAccountDetails,
  initializeUserClient,
} from '../util/helper';

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
    const paymentAccountDetail = await getUserPaymentAccountDetails(this.client, accountId);

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
      baseDocumentId: null, //TODO: add base_document_id to entity
    }).save();

    Logger.log(
      `FBO payments account(${newPaymentsAccount.userAccountId}) successfully created for user -- ${user.id}`,
    );

    //TODO update the first & last name of the Jump User

    return {
      status: HttpStatus.CREATED,
      msg: `Payments account created for user -- ${user.id}`,
      account: newPaymentsAccount,
    };
  }

  public async updateKyc(
    bodyParams: UpdateKycDto,
    user: User,
    ip_address: Ipv4Address,
  ): Promise<{ status: httpstatus; msg: string }> {
    //check local DB to see if synapse account exists
    const userPaymentsAccount = await this.getUserPaymentsAccount(user.id);

    if (!userPaymentsAccount) {
      throw new UserPaymentsAccountNotFound();
    }

    // check synapse database for account
    let paymentsUser: PaymentsUser;
    let baseDocument: ISynapseBaseDocuments;
    try {
      paymentsUser = await this.client.getUser(
        userPaymentsAccount.paymentsAccount.userAccountId,
        {},
      );
    } catch (error) {
      throw new UserPaymentsAccountNotFound();
    }

    try {
      baseDocument = paymentsUser.body.documents[0];
    } catch (error) {
      throw new BaseDocumentError();
    }

    // Generate the patch
    const updatePaymentAccountParams = createUserParams(
      user.id,
      bodyParams,
      ip_address,
      baseDocument,
    );
    const response = await paymentsUser
      .updateUser(updatePaymentAccountParams)
      .then((data: any) => {
        Logger.log(
          `FBO payments account(${userPaymentsAccount.id}) successfully updated for user -- ${user.id}`,
        );
        if (!data) {
          return undefined;
        }
        return {
          status: HttpStatus.OK,
          msg: `Payments account updated for user -- ${user.id}`,
        };
      })
      .catch((error) => {
        if (error?.response) {
          throw new AccountPatchError(error.response?.data);
        }
      });
    if (response === undefined || !response) {
      throw new AccountPatchError({ error: { en: 'Something went wrong', code: '' } });
    }
    return response;
  }

  public async createNode(user: User, headers: object, ip_address: string): Promise<any> {
    //Get our user's saved account data
    const paymentAccount = await this.getUserPaymentsAccount(user.id);
    const { refreshToken, userAccountId } = paymentAccount.paymentsAccount;

    const paymentAccountDetail = await getUserPaymentAccountDetails(this.client, userAccountId);
    const base_document_id = paymentAccountDetail.documents[0].id;

    //initialize the synapse user client to communicate with the synapse API
    const userClient = initializeUserClient(userAccountId, headers, ip_address, this.client);

    //get our oauth token to make actions on behalf of the user
    const tokens = await getOAuthKey(userClient, refreshToken);

    //create the first node, or deposit hub
    const depositHub = await createDepositNode(userClient);

    console.log('node', depositHub);

    //update the oauth in the user model for future uses
    const updatedAccount = await UserPaymentsAccount.updatePaymentAccount(
      userAccountId,
      tokens,
      base_document_id,
      depositHub.nodes[0]._id,
    );
    console.log('after update:', updatedAccount);

    // // console.log('node', node);
    return 'sqwah';
  }
  // return userPaymentsAccount;
  // }
}

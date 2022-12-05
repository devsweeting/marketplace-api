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
import { AccountPatchError } from '../exceptions/account-patch-failure.exception';
import { AddressVerificationFailedException } from '../exceptions/address-verification-failed.exception';
import { BaseDocumentError } from '../exceptions/base-document-error-exception';
import { UserPaymentsAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import {
  IAddressResponse,
  IUserPaymentAccountResponse,
  IPaymentsAccountResponse,
} from '../interfaces/create-account';
import { IPermissionCodes, IPermissions, ISynapseBaseDocuments } from '../interfaces/synapse-node';
import {
  createPaymentProviderUserAccount,
  createUserParams,
  initializeSynapseUserClient as initializeProviderUserClient,
} from '../util/kyc-helper';
import {
  createPaymentsDepositHub as createProviderDepositNode,
  getSynapseOAuthKey as getProviderOAuthKey,
  viewSynapseUserDetails as viewProviderUserDetails,
} from '../util/node-helper';

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
    const paymentAccountDetail = await viewProviderUserDetails(this.client, accountId);

    return {
      status: HttpStatus.OK,
      data: { user: paymentAccount, account: paymentAccountDetail },
    };
  }

  public async submitKYC(
    bodyParams: BasicKycDto,
    user: User,
    headers: object,
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

    //Create new FBO payments account with payment provider
    const providerPaymentAccount = await createPaymentProviderUserAccount(
      this.client,
      accountUserParams,
      ip_address,
    );

    //Associate the new payment account details with the Jump user:
    const localPaymentsAccount = await UserPaymentsAccount.create({
      userId: user.id,
      userAccountId: providerPaymentAccount._id,
      depositNodeId: null,
      refreshToken: providerPaymentAccount.refresh_token,
      permission: providerPaymentAccount.permission as IPermissions,
      permissionCode: providerPaymentAccount.permission_code as IPermissionCodes,
      oauthKey: providerPaymentAccount.oauth_key, //TODO update test
      baseDocumentId: providerPaymentAccount.documents[0].id, //TODO update test
    }).save();

    const { userAccountId, refreshToken, baseDocumentId } = localPaymentsAccount;

    //Initialize the client to communicate with the Payments Provider API
    const userClient = initializeProviderUserClient(
      userAccountId,
      headers,
      ip_address,
      this.client,
    );

    //Retrieve oauth token to make actions on behalf of the user.
    const tokens = await getProviderOAuthKey(userClient, refreshToken);

    //Create the deposit hub node.
    const depositHub = await createProviderDepositNode(userClient, baseDocumentId);

    //Update pertinent account details for future reference.
    if (depositHub.success === true) {
      await UserPaymentsAccount.updateDetailsOnNodeCreation(
        userAccountId,
        tokens,
        depositHub.nodes[0]._id,
      );
    }

    Logger.log(
      `FBO payments account(${localPaymentsAccount.userAccountId}) successfully created for user -- ${user.id}`,
    );

    return {
      status: HttpStatus.CREATED,
      msg: `Payments account created for user -- ${user.id}`,
      account: localPaymentsAccount,
    };
  }

  public async updateKyc(
    bodyParams: UpdateKycDto,
    user: User,
    ip_address: Ipv4Address,
  ): Promise<{ status: httpstatus; msg: string }> {
    //check local DB to see if synapse account exists
    const paymentsUser = await this.getExternalAccountFromUser(user);
    let baseDocument: ISynapseBaseDocuments;
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
          `FBO payments account(${paymentsUser.id}) successfully updated for user -- ${user.id}`,
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

  public async closeUser(user: User): Promise<{ status: HttpStatus; message: string }> {
    return await this.updateUserPermission(user, 'CLOSED', 'USER_REQUEST');
  }

  public async updateUserPermission(
    user: User,
    permission: IPermissions,
    permissionCode: IPermissionCodes,
  ): Promise<{ status: HttpStatus; message: string }> {
    const paymentsUser = await this.getExternalAccountFromUser(user);

    const res = await paymentsUser
      .updateUser({
        permission: permission,
        permission_code: permissionCode,
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        throw new AccountPatchError(error.response?.data);
      });

    if (res.status == HttpStatus.OK) {
      Logger.log(
        `FBO payments account(${paymentsUser.id}) successfully updated with permission ${permission} reason ${permissionCode} for user -- ${user.id}`,
      );
      return {
        status: res.status,
        message: 'Updated user permissions',
      };
    }
    return {
      status: res.status,
      message: res.data?.message,
    };
  }

  public async getExternalAccountFromUser(user: User): Promise<PaymentsUser> {
    const userPaymentsAccount = await this.getUserPaymentsAccount(user.id);

    if (!userPaymentsAccount) {
      throw new UserPaymentsAccountNotFound();
    }

    // check synapse database for account
    let paymentsUser: PaymentsUser;
    try {
      paymentsUser = await this.client.getUser(
        userPaymentsAccount.paymentsAccount.userAccountId,
        {},
      );
    } catch (error) {
      throw new UserPaymentsAccountNotFound();
    }
    return paymentsUser;
  }

  public async getAgreementPreview(user: User): Promise<{ type: 'NODE_AGREEMENT'; url: string }[]> {
    const paymentsUser = await this.getExternalAccountFromUser(user);
    let baseDocument: ISynapseBaseDocuments;
    try {
      baseDocument = paymentsUser.body.documents[0];
    } catch (error) {
      throw new BaseDocumentError();
    }

    const res = await createPaymentsDepositHub(paymentsUser, baseDocument.id, true);
    if (res.node_count < 1) {
      throw new Error('No agreements'); // TODO - create custom error;
    }

    const agreements = res.nodes[0]?.info?.agreements;
    if (agreements) {
      return agreements;
    }
    throw new Error('No agreements found'); // TODO - create custom error;
  }

  public async saveAgreementAcknowledgement(user: User) {
    const paymentsUser = await this.getExternalAccountFromUser(user);
    const res = await UserPaymentsAccount.updateAgreementAcknowledgement(
      paymentsUser.id,
      'ACCEPTED',
    );
    console.log('here', res);
    //TODO save to user agreement
    //TODO return response to users

    return {
      status: HttpStatus.CREATED,
    };
  }
}

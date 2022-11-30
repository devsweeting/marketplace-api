import {
  IDepositNodeResponse,
  IDepositNodeRequest,
  IGetOAuthHeadersResponse,
  ISynapseAccountResponse,
  ISynapseUserClient,
} from '../interfaces/synapse-node';
import { StatusCodes } from 'http-status-codes';
import { Client, User } from 'synapsenode';
import { UserPaymentsAccount } from '../entities/user-payments-account.entity';
import { PaymentProviderOAuthFailure } from '../exceptions/oauth-failure.exception';
import { UserPaymentsAccountNotFound } from '../exceptions/user-account-verification-failed.exception';

const CONVERT_TO_MILLISECONDS = 1000;

const IS_DEVELOPMENT = process.env.NODE_ENV === 'DEVELOP';

const permissionScope = [
  'USER|PATCH',
  'USER|GET',
  'NODES|POST',
  'NODES|GET',
  'NODE|GET',
  'NODE|PATCH',
  'NODE|DELETE',
  'TRANS|POST',
  'TRANS|GET',
  'TRAN|GET',
  'TRAN|PATCH',
  'TRAN|DELETE',
  'SUBNETS|POST',
  'SUBNETS|GET',
  'SUBNET|GET',
  'SUBNET|PATCH',
  'STATEMENTS|GET',
  'STATEMENT|GET',
  'STATEMENTS|POST',
  'CONVERSATIONS|POST',
  'CONVERSATIONS|GET',
  'CONVERSATION|GET',
  'CONVERSATION|PATCH',
  'MESSAGES|POST',
  'MESSAGES|GET',
];

/**
 * Returns the full user payment account details
 */

export async function viewSynapseUserDetails(
  client: Client,
  accountId: string,
  paymentAccount?: UserPaymentsAccount,
): Promise<ISynapseAccountResponse> {
  const accountDetails: ISynapseAccountResponse = await client
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
    });

  //update the db with the latest user refresh token if an account is passed in
  if (paymentAccount) {
    Object.assign(paymentAccount, { refreshToken: accountDetails.refresh_token });
    await paymentAccount.save();
    await paymentAccount.reload();
  }

  return accountDetails;
}

/**
 * Return the users payment account auth token
 */
export async function getSynapseOAuthKey(
  userClient: ISynapseUserClient,
  refreshToken: string,
): Promise<{ oauthKey; oauthKeyExpiresAt; refreshToken }> {
  const response: IGetOAuthHeadersResponse = await userClient
    ._oauthUser({
      refresh_token: refreshToken,
      scope: permissionScope,
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      if (err) {
        throw new PaymentProviderOAuthFailure(err.response.data); // TODO - create custom error
      }
    });

  return {
    oauthKey: response.oauth_key,
    oauthKeyExpiresAt: new Date(parseInt(response.expires_at) * CONVERT_TO_MILLISECONDS),
    refreshToken: response.refresh_token,
  };
}

/**
 * Create the User's Deposit Hub.
 */
export async function createSynapseDepositHub(
  userClient: User,
  baseDocumentId: string,
): Promise<IDepositNodeResponse> {
  const bodyParams: IDepositNodeRequest = {
    type: 'IC-DEPOSIT-US',
    info: {
      nickname: `${IS_DEVELOPMENT ? 'test' : 'insert name'} Deposit Account`,
      document_id: baseDocumentId,
    },
    preview_only: false,
  };

  const response = await userClient
    .createNode(bodyParams)
    .then((resp) => {
      return resp.data;
    })
    .catch((err) => {
      if (err) {
        throw new Error(err.response.data); // TODO - create custom error
      }
    });

  return response;
}

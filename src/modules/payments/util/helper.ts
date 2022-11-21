import { StatusCodes } from 'http-status-codes';
import { Client, User } from 'synapsenode';
import { UserPaymentsAccount } from '../entities/user-payments-account.entity';
import { PaymentProviderOAuthFailure } from '../exceptions/oauth-failure.exception';
import { UserPaymentsAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import {
  IGetOAuthHeadersResponse,
  IOAuthHeaders,
  ISynapseUserClient,
} from '../interfaces/synapse-node';

const CONVERT_TO_MILLISECONDS = 1000;

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
export async function getUserPaymentAccountDetails(
  client: Client,
  accountId: string,
): Promise<any> {
  return await client
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
}

export function initializeUserClient(
  paymentAccountId: string,
  headers: object,
  ip_address: string,
  client: Client,
): ISynapseUserClient {
  const headerObj: IOAuthHeaders = {
    fingerprint: process.env.FINGERPRINT,
    ip_address: ip_address,
    ...headers,
  };

  return new User({
    data: { _id: paymentAccountId },
    headerObj,
    client: client,
  }) as ISynapseUserClient;
}

/**
 * OAuth expires in two hours
 */
export async function getOAuthKey(
  userClient: ISynapseUserClient,
  refreshToken: string,
): Promise<Partial<UserPaymentsAccount>> {
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
        console.log('error', err.response.data);
        throw new PaymentProviderOAuthFailure(err.response.data); // TODO - create custom error
      }
    });
  return {
    oauthKey: response.oauth_key,
    oauthKeyExpiresAt: new Date(parseInt(response.expires_at) * CONVERT_TO_MILLISECONDS),
    refreshToken: response.refresh_token,
  };
}

interface ICreateNodeRequest {
  type: 'IC-DEPOSIT-US';
  info: {
    nickname: string; //consider more dynamic name
    document_id: string;
  };
  preview_only: boolean;
}

/**
 * Create synapse subnet
 */
export async function createDepositNode(
  client: User,
  // paymentAccount: UserPaymentsAccount,
): Promise<any> {
  const base_document_id = '7df3a5f687d6c081801b50887def735d5dee405a7f9124e76840f694d3018385';
  const bodyParams: ICreateNodeRequest = {
    type: 'IC-DEPOSIT-US',
    info: {
      nickname: `${'test'} Interest Deposit Account`,
      document_id: `${base_document_id}`, //make dynamic
    },
    preview_only: false,
  };

  const response = await client
    .createNode(bodyParams)
    .then((resp) => {
      console.log('resp', resp.data);
      return resp.data;
    })
    .catch((err) => {
      if (err) {
        console.log('error', err.response.data);
        throw new Error(err.response.data); // TODO - create custom error
      }
    });

  return response;
}

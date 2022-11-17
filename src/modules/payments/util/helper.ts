import { HttpStatus } from '@nestjs/common';
import { Client, User } from 'synapsenode';
import { PaymentProviderOAuthFailure } from '../exceptions/oauth-failure.exception';
import {
  IGetOAuthHeadersResponse,
  IOAuthHeaders,
  ISynapseUserClient,
} from '../interfaces/synapse-node';

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
): Promise<IGetOAuthHeadersResponse> {
  const OAuthKey = await userClient
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

  //TODO consider adding logic to verify and update the refresh token here

  return OAuthKey;
}

/**
 * Create synapse subnet
 */

export async function createSubnet(OAuthKey: string) {
  console.log('OAuthKey', OAuthKey);
  return HttpStatus.I_AM_A_TEAPOT;
}

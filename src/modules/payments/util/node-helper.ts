import {
  IDepositNodeResponse,
  IDepositNodeRequest,
  IGetOAuthHeadersResponse,
  ISynapseAccountResponse,
  ISynapseUserClient,
} from '../interfaces/synapse-node';
import { Client, User as PaymentsUser } from 'synapsenode';
import { PaymentProviderOAuthFailure } from '../exceptions/oauth-failure.exception';
import { UserPaymentsAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import { PaymentProviderError } from '../exceptions/payment-provider-error.exception';

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
): Promise<ISynapseAccountResponse> {
  const accountDetails: ISynapseAccountResponse = await client
    .getUser(accountId, null)
    .then(({ body }) => {
      return body;
    })
    .catch(() => {
      throw new UserPaymentsAccountNotFound();
    });

  return accountDetails;
}

/**
 * Returns the users payment account auth token
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
        throw new PaymentProviderOAuthFailure(err.response.data);
      }
    });

  return {
    oauthKey: response.oauth_key,
    oauthKeyExpiresAt: new Date(parseInt(response.expires_at) * CONVERT_TO_MILLISECONDS),
    refreshToken: response.refresh_token,
  };
}

/**
 * Creates the User's Deposit Account Node.
 */
export async function createPaymentsDepositHub(
  userClient: PaymentsUser,
  baseDocumentId: string,
): Promise<IDepositNodeResponse> {
  const bodyParams: IDepositNodeRequest = {
    type: 'IC-DEPOSIT-US',
    info: {
      nickname: `${IS_DEVELOPMENT ? 'Test' : ''} Deposit Account`,
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
        throw new PaymentProviderError(err.response.data);
      }
    });

  return response;
}

import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { BasicKycDto } from '../dto/basic-kyc.dto';
import { UpdateKycDto } from '../dto/update-kyc.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import {
  IGenericDoc,
  IPhysicalDocumentType,
  ISocialDoc,
  ISocialDocumentType,
  ISynapseAccountResponse,
  ISynapseBaseDocuments,
  IVirtualDocumentType,
  IGetOAuthHeadersResponse,
  IOAuthHeaders,
  ISynapseUserClient,
} from '../interfaces/synapse-node';
import { StatusCodes } from 'http-status-codes';
import { Client, User } from 'synapsenode';
import { UserPaymentsAccount } from '../entities/user-payments-account.entity';
import { PaymentProviderOAuthFailure } from '../exceptions/oauth-failure.exception';
import { UserPaymentsAccountNotFound } from '../exceptions/user-account-verification-failed.exception';

const CONVERT_TO_MILLISECONDS = 1000;

const IS_DEVELOPMENT = process.env.NODE_ENV === 'DEVELOP';

export function createUserParams(
  userId: string,
  bodyParams: BasicKycDto | UpdateKycDto,
  ip_address: Ipv4Address,
  baseDocument?: ISynapseBaseDocuments,
): ISynapseAccountResponse {
  const fullName = `${bodyParams.first_name} ${bodyParams.last_name}`;
  const createNewPaymentAccountParams = {
    logins: [{ email: bodyParams.email }],
    phone_numbers: [bodyParams.phone_numbers],
    legal_names: [fullName],
    documents: [createKYCDocument(bodyParams, fullName, ip_address, baseDocument)],
    extra: {
      supp_id: userId,
      cip_tag: 1,
      is_business: false,
    },
  };
  return createNewPaymentAccountParams;
}

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

export function createKYCDocument(
  { date_of_birth, mailing_address, gender, email, phone_numbers }: BasicKycDto | UpdateKycDto,
  fullName: string,
  ip_address: Ipv4Address,
  baseDocument?: ISynapseBaseDocuments,
): ISynapseBaseDocuments {
  let document: ISynapseBaseDocuments = {
    id: baseDocument?.id,
    email: email,
    phone_number: phone_numbers,
    ip: ip_address,
    name: fullName,
    alias: `${fullName} ${IS_DEVELOPMENT ? 'test' : 'payments'} account`,
    entity_scope: 'Arts & Entertainment',
    entity_type: gender ?? 'NOT_KNOWN',
    day: date_of_birth.day,
    month: date_of_birth.month,
    year: date_of_birth.year,
  };

  if (mailing_address) {
    document = {
      ...document,
      address_street: mailing_address.address_street,
      address_city: mailing_address.address_city,
      address_subdivision: mailing_address.address_subdivision,
      address_postal_code: mailing_address.address_postal_code,
      address_country_code: mailing_address.address_country_code,
    };
    let addressDocumentId: string | undefined;
    if (baseDocument && baseDocument?.social_docs && baseDocument?.social_docs.length > 0) {
      addressDocumentId = findFirstInstanceOfDocType(baseDocument?.social_docs, 'MAILING_ADDRESS');
    }
    // We don't want social docs included in the patch if it doesn't exist
    if (!document || addressDocumentId) {
      const social_docs: ISocialDoc = {
        id: addressDocumentId,
        document_value: concatMailingAddress(mailing_address),
        document_type: 'MAILING_ADDRESS' as ISocialDocumentType,
        meta: {
          address_street: mailing_address.address_street,
          address_city: mailing_address.address_city,
          address_subdivision: mailing_address.address_subdivision,
          address_postal_code: mailing_address.address_postal_code,
          address_country_code: mailing_address.address_country_code,
          address_care_of: fullName,
        },
      };
      document.social_docs = [{ ...social_docs }];
    }
  }
  return document;
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

function concatMailingAddress(mailing_address: VerifyAddressDto): string {
  return `${mailing_address.address_city} ${mailing_address.address_street} ${mailing_address.address_subdivision} ${mailing_address.address_country_code} ${mailing_address.address_postal_code}`;
}

function findFirstInstanceOfDocType(
  documents: IGenericDoc[],
  docType: ISocialDocumentType | IPhysicalDocumentType | IVirtualDocumentType,
): string | undefined {
  let id: string;
  documents.map((doc) => {
    if (doc.document_type === docType) {
      id = doc.id;
    }
    return undefined;
  });
  return id;
}

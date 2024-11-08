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
  IOAuthHeaders,
  ISynapseUserClient,
} from '../interfaces/synapse-node';
import { Client, User } from 'synapsenode';
import { PaymentsAccountCreationFailed } from '../exceptions/account-creation-failure.exception';
import { PaymentsAccountDto } from '../dto/payments-account.dto';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'DEVELOP';

export function createUserParams(
  userId: string,
  bodyParams: BasicKycDto | UpdateKycDto | PaymentsAccountDto,
  ip_address: Ipv4Address,
  baseDocument?: ISynapseBaseDocuments,
): ISynapseAccountResponse {
  const fullName = bodyParams.first_name
    ? `${bodyParams.first_name} ${bodyParams.last_name}`
    : undefined;

  const createNewPaymentAccountParams: any = {
    documents: [createKYCDocument(bodyParams, fullName, ip_address, baseDocument)],
    extra: {
      supp_id: userId,
      cip_tag: 1,
      is_business: false,
    },
  };

  if (bodyParams.email) {
    createNewPaymentAccountParams.logins = [{ email: bodyParams.email }];
  }
  if (bodyParams.phone_numbers) {
    createNewPaymentAccountParams.phone_numbers = [bodyParams.phone_numbers];
  }
  if (fullName) {
    createNewPaymentAccountParams.legal_names = [fullName];
  }

  return createNewPaymentAccountParams;
}
export async function createPaymentProviderUserAccount(
  client: Client,
  accountParams: ISynapseAccountResponse,
  ip_address: string,
): Promise<ISynapseAccountResponse> {
  const account: ISynapseAccountResponse = await client
    .createUser(accountParams, ip_address, {})
    .then((data) => {
      return data.body;
    })
    .catch((err) => {
      throw new PaymentsAccountCreationFailed(err.response.data);
    });

  return account;
}

export function initializeSynapseUserClient(
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
  {
    date_of_birth,
    mailing_address,
    gender,
    email,
    phone_numbers,
  }: BasicKycDto | UpdateKycDto | PaymentsAccountDto,
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
    day: date_of_birth?.day,
    month: date_of_birth?.month,
    year: date_of_birth?.year,
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

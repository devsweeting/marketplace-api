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
} from '../interfaces/synapse-node';

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

export function createKYCDocument(
  { date_of_birth, mailing_address, gender, email, phone_numbers }: BasicKycDto | UpdateKycDto,
  fullName: string,
  ip_address: Ipv4Address,
  baseDocument?: ISynapseBaseDocuments,
): ISynapseBaseDocuments {
  // const { date_of_birth, mailing_address, gender } = bodyParams;
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
    if (baseDocument && baseDocument?.social_docs.length > 0) {
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

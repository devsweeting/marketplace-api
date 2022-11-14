import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { BasicKycDto } from '../dto/basic-kyc.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { ICreatePaymentAccountParams, IDocument } from '../interfaces/create-account';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'DEVELOP';

export function createUserParams(
  userId: string,
  bodyParams: BasicKycDto,
  ip_address: Ipv4Address,
): ICreatePaymentAccountParams {
  const fullName = `${bodyParams.first_name} ${bodyParams.last_name}`;
  const createNewPaymentAccountParams = {
    logins: [{ email: bodyParams.email }],
    phone_numbers: [bodyParams.phone_numbers],
    legal_names: [fullName],
    documents: [createKYCDocument(bodyParams, fullName, ip_address)],
    extra: {
      supp_id: userId,
      cip_tag: 1,
      is_business: false,
    },
  };
  return createNewPaymentAccountParams;
}

export function createKYCDocument(
  bodyParams: BasicKycDto,
  fullName: string,
  ip_address: Ipv4Address,
): IDocument {
  const { date_of_birth, mailing_address, gender } = bodyParams;

  const document: IDocument = {
    email: bodyParams.email,
    phone_number: bodyParams.phone_numbers,
    ip: ip_address,
    name: fullName,
    alias: `${fullName} ${IS_DEVELOPMENT ? 'test' : 'payments'} account`,
    entity_scope: 'Arts & Entertainment',
    entity_type: gender ?? 'NOT_KNOWN',
    day: date_of_birth.day,
    month: date_of_birth.month,
    year: date_of_birth.year,
    address_street: mailing_address.address_street,
    address_city: mailing_address.address_city,
    address_subdivision: mailing_address.address_subdivision,
    address_postal_code: mailing_address.address_postal_code,
    address_country_code: mailing_address.address_country_code,
    social_docs: [
      {
        document_value: concatMailingAddress(mailing_address),
        document_type: 'MAILING_ADDRESS',
        meta: {
          address_street: mailing_address.address_street,
          address_city: mailing_address.address_city,
          address_subdivision: mailing_address.address_subdivision,
          address_postal_code: mailing_address.address_postal_code,
          address_country_code: mailing_address.address_country_code,
          address_care_of: fullName,
        },
      },
    ],
  };
  return document;
}

function concatMailingAddress(mailing_address: VerifyAddressDto): string {
  return `${mailing_address.address_city} ${mailing_address.address_street} ${mailing_address.address_subdivision} ${mailing_address.address_country_code} ${mailing_address.address_postal_code}`;
}

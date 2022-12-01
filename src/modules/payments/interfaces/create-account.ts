import { HttpStatus } from 'aws-sdk/clients/lambda';
import { User } from 'modules/users/entities';
import { UserPaymentsAccount } from '../entities/user-payments-account.entity';
import { ISynapseAccountResponse } from './synapse-node';

export interface ICreatePaymentAccountParams {
  logins: { email: string }[];
  phone_numbers: string[];
  legal_names: string[];
  documents: IDocument[];
  extra: {
    supp_id: string;
    cip_tag: number;
    is_business: boolean;
  };
}

export interface ISocialDocument {
  document_value: string; //Ex: '101 2nd St. STE 1500 SF CA US 94105' //full address name
  document_type: 'MAILING_ADDRESS';
  meta: {
    address_street: string;
    address_city: string;
    address_subdivision: string;
    address_postal_code: string;
    address_country_code: string;
    address_care_of: string;
  };
}
export interface IDocument {
  email: string;
  phone_number: string;
  ip: string;
  name: string;
  alias: string;
  entity_scope: 'Arts & Entertainment';
  entity_type: 'M' | 'F' | 'O' | 'NOT_KNOWN';
  day: number;
  month: number;
  year: number;
  address_street: string;
  address_city: string;
  address_subdivision: string;
  address_postal_code: string;
  address_country_code: string;
  social_docs: ISocialDocument[];
  //   virtual_docs?: Array<any>;
  //   physical_docs?: Array<any>;
}
[];

export type IPermissions =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'RECEIVE'
  | 'SEND-AND-RECEIVE'
  | 'LOCKED'
  | 'CLOSED'
  | 'MAKE-IT-GO-AWAY';

export type IPermissionCodes =
  | 'NOT_KNOWN'
  | 'UNUSUAL_ACTIVITY|COMPLIANCE_SUSPICIOUS'
  | 'UNUSUAL_ACTIVITY|LEGAL_REQUEST'
  | 'KYC_FRAUD|BLOCKED_LIST'
  | 'KYC_FRAUD|FRAUDULENT_DOCS'
  | 'BLOCKED_INDUSTRY'
  | 'HIGH_RETURNS'
  | 'NEGATIVE_BALANCE'
  | 'PLATFORM_REQUEST'
  | 'USER_REQUEST'
  | 'DUPLICATE_ACCOUNT'
  | 'UNUSUAL_ACTIVITY|COMPLIANCE_SUSPICIOUS'
  | 'BLOCKED_INDUSTRY'
  | 'PLATFORM_REQUEST'
  | 'USER_REQUEST'
  | 'PLATFORM_TERMINATED'
  | 'NO_ACTIVITY'
  | 'PERMANENT_CLOSURE';

export interface IPaymentsAccountResponse {
  status: number;
  msg: string;
  account: UserPaymentsAccount;
}

export type ErrorResponse = string | object;

export interface IUserPaymentAccountResponse {
  status: HttpStatus;
  data: {
    user: User;
    account: ISynapseAccountResponse;
  };
}
export type IDeliverability =
  | 'usps_deliverable'
  | 'deliverable'
  | 'deliverable_incorrect_unit'
  | 'deliverable_missing_unit'
  | 'deliverable_unneccessary_unit'
  | 'google_undeliverable';
export interface IAddressResponse {
  deliverability: IDeliverability;
  deliverability_analysis: {
    partial_valid: boolean;
    primary_number_invalid: boolean;
    primary_number_missing: boolean;
    secondary_invalid: boolean;
    secondary_missing: boolean;
  };
  normalized_address: {
    address_city?: string;
    address_country_code?: string;
    address_postal_code?: string;
    address_street?: string;
    address_subdivision?: string;
  };
}

export interface IPaymentsAccountErrorMessage {
  error: {
    code: string;
    en: string;
  };
  // error_code: HttpStatus;
  // http_code: HttpStatus;
  // success: boolean;
}

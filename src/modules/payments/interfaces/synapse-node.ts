export interface ISynapseAccountResponse {
  _id: string;
  _links: {
    self: {
      href: string;
    };
  };
  account_closure_date?: Date | null;
  client: { id: string; name: string };
  emails: string[];
  extra: {
    cip_tag: number;
    date_joined: number;
    extra_security: boolean;
    is_business: boolean;
    is_trusted: boolean;
    last_updated: number;
    public_note: null | string;
    supp_id: string;
  };
  flag: string;
  flag_code: string | null;
  is_hidden: boolean;
  legal_names: string[];
  logins: { email: string; scope: string }[];
  permission: string;
  permission_code: string | null;
  phone_numbers: string[];
  photos: any[];
  refresh_token: string;
  watchlists: string;
  documents: ISynapseDocuments[];
}

interface ISynapseDocuments {
  id: string;
  id_score?: string;
  is_active?: boolean;
  name?: string;
  permission_scope?: string;
  entity_type?: string;
  entity_scope?: string;
  trust_level?: string;
  email?: string;
  phone_number?: string;
  virtual_docs?: IGenericDoc[];
  physical_docs?: IGenericDoc[];
  social_docs?: ISocialDoc[];
  required_edd_docs?: IGenericDoc[];
  watchlists?: string;
}

interface IGenericDoc {
  id: string;
  document_value?: string;
  document_type?: string;
  meta?: Record<string, string>;
}

interface ISocialDoc extends IGenericDoc {
  document_type?: ISocialDocumentType;
}

export type IVirtualDocumentType =
  | 'SSN'
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'PERSONAL_IDENTIFICATION'
  | 'TIN'
  | 'DUNS'
  | 'CITIZENSHIP'
  | 'STATE_IDENTIFICATION_FOREIGN'
  | 'FATHER_FULL_NAME'
  | 'MOTHER_FULL_NAME'
  | 'DTI'
  | 'OTHER';

type ISocialDocumentType =
  | 'EMAIL_2FA'
  | 'PHONE_NUMBER_2FA'
  | 'EMAIL'
  | 'IP'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'TWITTER'
  | 'PHONE_NUMBER'
  | 'WEBSITE'
  | 'EMPLOYER'
  | 'UNIVERSITY'
  | 'OTHER'
  | 'MAILING_ADDRESS';

export type IPhysicalDocumentType =
  | 'GOVT_ID'
  | 'GOVT_ID_INT'
  | 'GOVT_ID_BACK'
  | 'GOVT_ID_INT_BACK'
  | 'VIDEO_AUTHORIZATION'
  | 'SELFIE'
  | 'PROOF_OF_ADDRESS'
  | 'PROOF_OF_INCOME'
  | 'PROOF_OF_ACCOUNT'
  | 'AUTHORIZATION'
  | 'SSN_CARD'
  | 'EIN_DOC'
  | 'SS4_DOC'
  | 'W9_DOC'
  | 'W8_DOC'
  | 'W2_DOC'
  | 'VOIDED_CHECK'
  | 'AOI'
  | 'BYLAWS_DOC'
  | 'LOE'
  | 'COI'
  | 'LBL'
  | 'SUBSIDIARY_DOC'
  | 'AML_POLICY'
  | 'BUSINESS_PLAN'
  | 'MTL'
  | 'MSB'
  | 'SECURITY_AUDIT'
  | 'BSA_AUDIT'
  | 'SOC_AUDIT'
  | 'STATE_AUDIT'
  | 'BUSINESS_INSURANCE'
  | 'TOS'
  | 'KYC_POLICY'
  | 'CIP_DOC'
  | 'SUBSCRIPTION_AGREEMENT'
  | 'PROMISSORY_NOTE'
  | 'LEGAL_AGREEMENT'
  | 'REG_GG'
  | 'DEPOSIT_AGREEMENT'
  | 'DBA_DOC'
  | 'OTHER'
  | 'BG_CHECK'
  | 'BG_CHECK_CONSENT'
  | 'ARTICLES_ORGANIZATION'
  | 'MEMO_OF_INCORPORATION'
  | 'PASSPORT_BIODATA'
  | 'PASSPORT_INFO'
  | 'VISA'
  | 'BUSINESS_LICENSE'
  | 'FOREIGN_ENTITY_REGISTRATION'
  | 'POSOF'
  | 'PROFIT_LOSS'
  | 'BANK_STATEMENT'
  | '1099-MISC'
  | 'PAYSTUB'
  | 'INVOICE'
  | 'MORTGAGE_STATEMENT'
  | 'PROPERTY_TAX_RECEIPT'
  | 'LEASE_AGREEMENT'
  | 'UNIVERSITY_LEASE'
  | 'UTILITY_BILL'
  | 'FORM_I94'
  | 'FORM_I20'
  | 'FORM_DS2019'
  | 'FORM_I797'
  | 'EMPLOYMENT_AUTHORIZATION_CARD'
  | 'PERMANENT_RESIDENT_CARD'
  | 'PERMANENT_RESIDENT_CARD_BACK'
  | 'NATIONAL_ID'
  | 'NATIONAL_ID_BACK'
  | 'PASSPORT_CARD'
  | 'DRIVER_LICENSE'
  | 'DRIVER_LICENSE_BACK'
  | 'VOTER_REGISTRATION_CARD'
  | 'VOTER_REGISTRATION_CARD_BACK'
  | 'LEGAL_OPINION_LETTER'
  | 'NO_ACTION_LETTER'
  | 'CUSTOMERS_BY_REVENUE'
  | 'FRAUD_PROGRAM'
  | 'COMPLAINTS_SUPPORT_AUDIT'
  | 'WOLFSBERG_QUESTIONNAIRE'
  | 'SECTION_313_FOREIGN_BANK_CERTIFICATE'
  | 'CYBER_LIABILITY_INSURANCE'
  | 'VCHECK_CONTENT_FORM'
  | 'RESUME'
  | '501_C_3_NOTIF';

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
  | 'DUPLICATE_ACCOUNT';

export type IScreeningResponse = 'FAILED' | 'PENDING' | 'FALSE_POSITIVE' | 'MATCH';

export type IEntityScope =
  | 'Not Known'
  | 'Airport'
  | 'Arts & Entertainment'
  | 'Automotive'
  | 'Bank & Financial Services'
  | 'Bar'
  | 'Book Store'
  | 'Business Services'
  | 'Religious Organization'
  | 'Club'
  | 'Community/Government'
  | 'Concert Venue'
  | 'Doctor'
  | 'Event Planning/Event Services'
  | 'Food/Grocery'
  | 'Health/Medical/Pharmacy'
  | 'Home Improvement'
  | 'Hospital/Clinic'
  | 'Hotel'
  | 'Landmark'
  | 'Lawyer'
  | 'Library'
  | 'Licensed Financial Representative'
  | 'Local Business'
  | 'Middle School'
  | 'Movie Theater'
  | 'Museum/Art Gallery'
  | 'Outdoor Gear/Sporting Goods'
  | 'Pet Services'
  | 'Professional Services'
  | 'Public Places'
  | 'Real Estate'
  | 'Restaurant/Cafe'
  | 'School'
  | 'Shopping/Retail'
  | 'Spas/Beauty/Personal Care'
  | 'Sports Venue'
  | 'Sports/Recreation/Activities'
  | 'Tours/Sightseeing'
  | 'Train Station'
  | 'Transportation'
  | 'University'
  | 'Aerospace/Defense'
  | 'Automobiles and Parts'
  | 'Bank/Financial Institution'
  | 'Biotechnology'
  | 'Cause'
  | 'Chemicals'
  | 'Community Organization'
  | 'Company'
  | 'Computers/Technology'
  | 'Consulting/Business Services'
  | 'Education'
  | 'Elementary School'
  | 'Energy/Utility'
  | 'Engineering/Construction'
  | 'Farming/Agriculture'
  | 'Food/Beverages'
  | 'Government Organization'
  | 'Health/Beauty'
  | 'Health/Medical/Pharmaceuticals'
  | 'Industrials'
  | 'Insurance Company'
  | 'Internet/Software'
  | 'Legal/Law'
  | 'Media/News/Publishing'
  | 'Mining/Materials'
  | 'Non-Governmental Organization (NGO)'
  | 'Non-Profit Organization'
  | 'Organization'
  | 'Political Organization'
  | 'Political Party'
  | 'Preschool'
  | 'Retail and Consumer Merchandise'
  | 'Small Business'
  | 'Telecommunication'
  | 'Transport/Freight'
  | 'Travel/Leisure';

export interface ICreateSynapseAccountParams {
  logins: { email: string }[];
  phone_numbers: string[]; //TODO add more type
  legal_names: string[];
  documents: ISynapseDocument[];
  extra: {
    supp_id: string;
    cip_tag: number;
    is_business: boolean;
  };
}

export interface ISynapseSocialDoc {
  document_value: string; // '101 2nd St. STE 1500 SF CA US 94105' //full address name
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
export interface ISynapseDocument {
  email: string;
  phone_number: string;
  ip: string;
  name: string;
  alias: string;
  entity_scope: 'Arts & Entertainment';
  entity_type: string; //TODO - what is this?
  day: number;
  month: number;
  year: number;
  address_street: string;
  address_city: string;
  address_subdivision: string;
  address_postal_code: string;
  address_country_code: string;
  social_docs: ISynapseSocialDoc[];
  //   virtual_docs?: [
  //     {
  //       document_value: '2222';
  //       document_type: 'SSN';
  //       meta: {
  //         country_code: 'US';
  //       };
  //     },
  //     {
  //       document_value: '2222';
  //       document_type: 'PASSPORT';
  //       meta: {
  //         country_code: 'US';
  //       };
  //     },
  //   ];
  //   physical_docs: [
  //     {
  //       document_value: 'data:image/gif;base64,SUQs==';
  //       document_type: 'GOVT_ID';
  //       meta: {
  //         country_code: 'US';
  //         state_code: 'CA';
  //       };
  //     },
  //     {
  //       document_value: 'data:image/gif;base64,SUQs==';
  //       document_type: 'GOVT_ID_BACK';
  //       meta: {
  //         country_code: 'US';
  //         state_code: 'CA';
  //       };
  //     },
  //   ];
  //   social_docs: [
  //     {
  //       document_value: '101 2nd St. STE 1500 SF CA US 94105'; //full address name
  //       document_type: 'MAILING_ADDRESS';
  //       meta: {
  //         address_street: string;
  //         address_city: string;
  //         address_subdivision: string;
  //         address_postal_code: string;
  //         address_country_code: string;
  //         address_care_of: string;
  //       };
  //     },
  //   ];
}
[];

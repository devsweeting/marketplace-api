import { CreateAccountDto } from './dto/create-account.dto';
import { UserSynapse } from './entities/user-synapse.entity';
import { IUserSynapseAccountResponse } from './interfaces/create-account';

export const mockCreateAccountQuery: CreateAccountDto = {
  first_name: 'Devin',
  last_name: 'Sweetums',
  email: 'test@example.com',
  phone_numbers: '202.762.1401',
  gender: 'M',
  date_of_birth: {
    day: 2,
    month: 5,
    year: 1989,
  },
  mailing_address: {
    address_street: '1 Market St.',
    address_city: 'SF',
    address_subdivision: 'CA',
    address_postal_code: '94105',
    address_country_code: 'US',
  },
};

export const synapsePostmanTestQuery = {
  logins: [
    {
      email: 'devintest@synapsepay.com',
      password: 'TestTest123$',
    },
  ],
  phone_numbers: ['901.111.1111'],
  legal_names: ['Devin Test User'],
  documents: [
    {
      email: 'devin@test.com',
      phone_number: '901.111.1112',
      ip: '::1',
      name: 'Devin Test User',
      alias: 'Devin Test',
      entity_type: 'M',
      entity_scope: 'Arts & Entertainment',
      day: 2,
      month: 5,
      year: 1989,
      address_street: '1 Market St.',
      address_city: 'SF',
      address_subdivision: 'CA',
      address_postal_code: '94105',
      address_country_code: 'US',
      virtual_docs: [
        {
          document_value: '2222',
          document_type: 'SSN',
          meta: {
            country_code: 'US',
          },
        },
        {
          document_value: '2222',
          document_type: 'PASSPORT',
          meta: {
            country_code: 'US',
          },
        },
      ],
      physical_docs: [
        {
          document_value: 'data:image/gif;base64,SUQs==',
          document_type: 'GOVT_ID',
          meta: {
            country_code: 'US',
            state_code: 'CA',
          },
        },
        {
          document_value: 'data:image/gif;base64,SUQs==',
          document_type: 'GOVT_ID_BACK',
          meta: {
            country_code: 'US',
            state_code: 'CA',
          },
        },
      ],
      social_docs: [
        {
          document_value: '101 2nd St. STE 1500 SF CA US 94105',
          document_type: 'MAILING_ADDRESS',
          meta: {
            address_street: '101 2nd St STE 1500',
            address_city: 'SF',
            address_subdivision: 'CA',
            address_postal_code: '94105',
            address_country_code: 'US',
            address_care_of: 'Some User',
          },
        },
      ],
    },
  ],
  extra: {
    supp_id: '122eddfgbeafrfvbbb',
    cip_tag: 1,
    is_business: false,
  },
};

export const synapseSavedUserCreatedResponse = {
  User: {
    id: '63603d35b174c5e009cda55c',
    body: {
      _id: '63603d35b174c5e009cda55c',
      _links: { self: [Object] },
      account_closure_date: null,
      client: { id: '63482ed8a8a19aa7d2ca520f', name: 'Devin Sweeting' },
      documents: [[Object]],
      emails: [],
      extra: {
        cip_tag: 1,
        date_joined: 1667251508669,
        extra_security: false,
        is_business: false,
        is_trusted: false,
        last_updated: 1667251508669,
        public_note: null,
        supp_id: '122eddfgbeafrfvbbb',
      },
      flag: 'NOT-FLAGGED',
      flag_code: null,
      is_hidden: false,
      legal_names: ['Devin Sweetums'],
      logins: [[Object]],
      permission: 'UNVERIFIED',
      permission_code: null,
      phone_numbers: ['202.762.1401'],
      photos: [],
      refresh_token: 'refresh_AtHCUXcWdyZl2bVs3zGS7h59IDw4LnMYi1poTv0B',
      watchlists: 'PENDING',
    },
    host: 'https://uat-api.synapsefi.com/v3.1',
    fingerprint: 'e83cf6ddcf778e37bfe3d48fc78a6502062fc',
    ip_address: '::ffff:172.18.0.1',
    oauth_key: 'oauth_zDsa7K89EUpLHGgJrRcmbSvAVdw0TFhCkOQ3en0u',
  },
};

export const account201: IUserSynapseAccountResponse = {
  status: 201,
  msg: 'Synapse account created for user -- 089d75f4-c321-43be-88ba-b2750d91451c',
  account: {
    userId: '089d75f4-c321-43be-88ba-b2750d91451c',
    userSynapseId: '63603d35b174c5e009cda55c',
    depositNodeId: null,
    permission: 'UNVERIFIED',
    permission_code: null,
    refreshToken: 'refresh_AtHCUXcWdyZl2bVs3zGS7h59IDw4LnMYi1poTv0B',
    deletedAt: null,
    id: '8d9980f4-41ef-41c3-82dd-1892be9dbd96',
    updatedAt: new Date('2022-11-04T16:10:40.941Z'),
    createdAt: new Date('2022-11-04T16:10:40.941Z'),
    isDeleted: false,
  } as UserSynapse,
};

export const account303: IUserSynapseAccountResponse = {
  status: 303,
  msg: 'Synapse account already exists for user -- 089d75f4-c321-43be-88ba-b2750d91451c',
  account: {
    id: '49141401-5756-4a7b-a1cb-3f00577a071c',
    updatedAt: new Date('2022-11-02T20:08:51.803Z'),
    createdAt: new Date('2022-11-02T20:08:51.803Z'),
    deletedAt: null,
    isDeleted: false,
    userId: '089d75f4-c321-43be-88ba-b2750d91451c',
    userSynapseId: '63603d35b174c5e009cda55c',
    depositNodeId: null,
    permission: 'UNVERIFIED',
    permission_code: null,
    refreshToken: 'refresh_AtHCUXcWdyZl2bVs3zGS7h59IDw4LnMYi1poTv0B',
  } as UserSynapse,
};

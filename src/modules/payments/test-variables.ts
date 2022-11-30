import { BasicKycDto } from './dto/basic-kyc.dto';
import { UserPaymentsAccount } from './entities/user-payments-account.entity';
import { IPaymentsAccountResponse } from './interfaces/create-account';

export const mockBasicKycQuery: BasicKycDto = {
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

export const paymentsAccountCreationSuccess = {
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

export const account201: IPaymentsAccountResponse = {
  status: 201,
  msg: 'Payments account created for user -- 089d75f4-c321-43be-88ba-b2750d91451c',
  account: {
    userId: '089d75f4-c321-43be-88ba-b2750d91451c',
    userAccountId: '63603d35b174c5e009cda55c',
    depositNodeId: null,
    permission: 'UNVERIFIED',
    permissionCode: null,
    refreshToken: 'refresh_AtHCUXcWdyZl2bVs3zGS7h59IDw4LnMYi1poTv0B',
    deletedAt: null,
    id: '8d9980f4-41ef-41c3-82dd-1892be9dbd96',
    updatedAt: new Date('2022-11-04T16:10:40.941Z'),
    createdAt: new Date('2022-11-04T16:10:40.941Z'),
    isDeleted: false,
  } as UserPaymentsAccount,
};

export const account303: IPaymentsAccountResponse = {
  status: 303,
  msg: 'Payments account already exists for user -- 089d75f4-c321-43be-88ba-b2750d91451c',
  account: {
    id: '49141401-5756-4a7b-a1cb-3f00577a071c',
    updatedAt: new Date('2022-11-02T20:08:51.803Z'),
    createdAt: new Date('2022-11-02T20:08:51.803Z'),
    deletedAt: null,
    isDeleted: false,
    userId: '089d75f4-c321-43be-88ba-b2750d91451c',
    userAccountId: '63603d35b174c5e009cda55c',
    depositNodeId: null,
    permission: 'UNVERIFIED',
    permissionCode: null,
    refreshToken: 'refresh_AtHCUXcWdyZl2bVs3zGS7h59IDw4LnMYi1poTv0B',
  } as UserPaymentsAccount,
};

export const synapseRefreshTokenFailedExample = {
  message: 'Payment Provider OAuth Request Failed',
  status: '409',
  error: {
    code: 'invalid_filter_refresh_token',
    en: "Unable to locate refresh token object with filter {'refresh_token': 'refresh_TNF7QRbKJhp8D6OqniekxU0vac1LuHZAtP3BslzY'}",
  },
};

export const synapseNewDepositAccountSuccess = {
  error_code: '0',
  http_code: '200',
  limit: 20,
  node_count: 1,
  nodes: [
    {
      _id: '6387c157316d2a55f98b37ae',
      _links: {
        self: {
          href: 'https://uat-api.synapsefi.com/v3.1/users/6387c146dfa0a5a8529a7e47/nodes/6387c157316d2a55f98b37ae',
        },
      },
      allowed: 'CREDIT-AND-DEBIT',
      allowed_status_code: null,
      client: {
        id: '633b6ad32c1ba741996ebe0b',
        name: 'Jump Co',
      },
      extra: {
        note: null,
        other: {
          ib_residual: 0,
        },
        supp_id: '',
      },
      info: {
        agreements: [
          {
            type: 'NODE_AGREEMENT',
            url: 'https://cdn.synapsepay.com/uploads/2022/11/30/Vd4tDZHMemgpwKPO9ALIJN2B08ojSz5EaW0lvcFk7GTiqQ3fUR.pdf',
          },
        ],
        balance: {
          amount: 0,
          currency: 'USD',
          interest: 0,
        },
        bank_code: 'EBT',
        document_id: 'b8f64a3cdc1d3ed5e218bc6de9725650dd771bdfd607038476864b5ab1fe4644',
        name_on_account: ' ',
        nickname: 'insert name Deposit Account',
      },
      is_active: true,
      timeline: [
        {
          date: 1669841227397,
          note: 'Node created.',
        },
      ],
      type: 'IC-DEPOSIT-US',
      user_id: '6387c146dfa0a5a8529a7e47',
    },
  ],
  page_count: 1,
  success: true,
};

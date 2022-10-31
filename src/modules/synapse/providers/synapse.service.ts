import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { BaseService } from 'modules/common/services';
import { Client } from 'synapsenode';
import { CreateAccountDto } from '../dto/create-account.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { AddressVerificationFailedException } from '../exceptions/address-verification-failed.exception';
import { UserSynapseAccountNotFound } from '../exceptions/user-account-verification-failed.exception';
import { ICreateSynapseAccountParams, ISynapseDocument } from '../interfaces/create-account';
import { synapseSavedUserCreatedResponse } from '../test-variables';

@Injectable()
export class SynapseService extends BaseService {
  public constructor(private readonly configService: ConfigService) {
    super();
  }
  client = new Client({
    client_id: this.configService.get('synapse.default.clientId'),
    client_secret: this.configService.get('synapse.default.clientSecret'),
    fingerprint: this.configService.get('synapse.default.fingerprint'),
    ip_address: this.configService.get('synapse.default.ipAddress'), //TODO - Update to pass the IP address of user for fraud detection
    isProduction: this.configService.get('synapse.default.isProduction'),
  });

  public async verifyAddress(dto: VerifyAddressDto): Promise<any> {
    const response = this.client
      .verifyAddress({
        address_city: dto.address_city,
        address_country_code: dto.address_country_code,
        address_postal_code: dto.address_postal_code,
        address_street: dto.address_street,
        address_subdivision: dto.address_subdivision,
      })
      .then(({ data }) => {
        return data;
      })
      .catch((error) => {
        if (error) {
          throw new AddressVerificationFailedException();
        }
      });
    return response;
  }

  public async getSynapseUserDetails(synapse_id: string): Promise<any> {
    const synapseUser = await this.client
      .getUser(synapse_id, null)
      .then((data) => {
        return {
          accountExists: true,
          userData: data.body,
        };
      })
      .catch(() => {
        return {
          accountExists: false,
          userData: new UserSynapseAccountNotFound(
            `Cannot locate user account with id -- ${synapse_id}`,
          ).getResponse(),
        };
      });
    return synapseUser;
  }

  public async createSynapseUserAccount(
    bodyParams: CreateAccountDto,
    ip_address: Ipv4Address,
  ): Promise<any> {
    // Step 1 -> Generate synapse account params
    const accountUserParams = this.createUserParams(bodyParams, ip_address);
    console.log('accountUserParams created', accountUserParams);

    // Step 2 -> Create user synapse account
    // const newAccount = await this.client
    //   .createUser(accountUserParams, ip_address, {})
    //   .then((data) => {
    //     console.log(data);
    //     return data;
    //   })
    //   .catch((err) => {
    //     console.log('ERROR CREATING SYNAPSE ACCOUNT', err.response.data);
    //   });
    const newAccount = synapseSavedUserCreatedResponse.User;
    console.log('test account created', synapseSavedUserCreatedResponse);
    // console.log('newAccount', newAccount);

    // Step 3: if successful then update our db with all of the required fields:
    // const user = updateSynapseUserDetails(newAccount)
    return newAccount;
  }

  private createSynapseDocument(
    bodyParams: CreateAccountDto,
    fullName: string,
    ip_address: Ipv4Address,
  ): ISynapseDocument {
    const { date_of_birth, mailing_address, gender } = bodyParams;

    const IS_DEVELOPMENT = process.env.NODE_ENV === 'DEVELOP';

    const document: ISynapseDocument = {
      email: bodyParams.email,
      phone_number: bodyParams.phone_numbers,
      ip: ip_address,
      name: fullName,
      alias: `${fullName} ${IS_DEVELOPMENT ? 'test' : 'synapse'} account`,
      entity_scope: 'Arts & Entertainment',
      entity_type: gender ? gender : 'NOT_KNOWN', //replace with '??'?
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
          document_value: '101 2nd St. STE 1500 SF CA US 94105',
          document_type: 'MAILING_ADDRESS',
          meta: {
            address_street: mailing_address.address_street,
            address_city: mailing_address.address_city,
            address_subdivision: mailing_address.address_subdivision,
            address_postal_code: mailing_address.address_postal_code,
            address_country_code: mailing_address.address_country_code,
            address_care_of: 'Some User TEST',
          },
        },
      ],
    };
    return document;
  }

  private createUserParams(
    bodyParams: CreateAccountDto,
    ip_address: Ipv4Address,
  ): ICreateSynapseAccountParams {
    const fullName = `${bodyParams.first_name} ${bodyParams.last_name}`;
    const createSynapseAccountParams = {
      logins: [{ email: bodyParams.email }],
      phone_numbers: [bodyParams.phone_numbers],
      legal_names: [fullName],
      documents: [this.createSynapseDocument(bodyParams, fullName, ip_address)],
      extra: {
        supp_id: '122eddfgbeafrfvbbb', //TODO - What is this used for? Could we send the Jump user id here instead?
        cip_tag: 1,
        is_business: false,
      },
    };
    return createSynapseAccountParams;
  }
}

import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerifyAddressDto } from './verify-address.dto';
import { DateOfBirthDto } from './date-of-birth.dto';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Lebron',
  })
  @IsString()
  @IsNotEmpty()
  public first_name: string;

  @ApiProperty({
    example: 'James',
  })
  @IsString()
  @IsNotEmpty()
  public last_name: string;

  @ApiProperty({
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    example: '123-456-7890',
  })
  @IsPhoneNumber('US')
  @IsNotEmpty()
  public phone_number: string;

  @ApiProperty({
    example: 'M',
  })
  @IsOptional()
  public gender?: 'M' | 'F' | 'O';

  @ApiProperty()
  @IsNotEmpty()
  public mailing_address: VerifyAddressDto;

  @ApiProperty()
  @IsNotEmpty()
  public date_of_birth: DateOfBirthDto;
}

export const jumpTestParamsRawBody = {
  first_name: 'Dev Test',
  last_name: 'API',
  email: 'test@example.com',
  phone_number: '202-762-1401',
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

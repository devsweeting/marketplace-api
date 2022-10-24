import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseService } from 'modules/common/services';
import { Client } from 'synapsenode';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { AddressVerificationFailedException } from '../exceptions/address-verification-failed.exception';
import { UserAccountVerification } from '../exceptions/user-account-verification-failed.exception';

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

  public async viewUserDetails(synapse_id): Promise<any> {
    const userDetails = this.client
      .getUser(synapse_id, null)
      .then((data) => {
        return data;
      })
      .catch((error) => {
        if (error) {
          throw new UserAccountVerification(`Cannot locate user account with id -- ${synapse_id}`);
        }
      });

    return userDetails;
  }
}

import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isGETMethod } from 'modules/admin/admin.utils';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';

import { encodeHashId } from 'modules/common/helpers/hash-id.helper';
import { ConfigService } from '@nestjs/config';

const getPartnerHashId = (serviceAccessor, record) => {
  const configService = serviceAccessor.getService(ConfigService);
  const params = flat.unflatten(record.params);

  if (params.id) {
    params.hashedId = encodeHashId(params.id, configService.get('custom.default.hashIdSalt'));
  }
  record.params = flat.flatten(params);
  return record;
};

export const getHashedId =
  (serviceAccessor: ServiceAccessor) =>
  async (response: RecordActionResponse, request: ActionRequest): Promise<RecordActionResponse> => {
    if (!isGETMethod(request)) {
      return response;
    }
    if (response.records) {
      await Promise.all(
        response.records.map(async (record) => {
          return getPartnerHashId(serviceAccessor, record);
        }),
      );
    } else {
      await getPartnerHashId(serviceAccessor, response.record);
    }

    return response;
  };

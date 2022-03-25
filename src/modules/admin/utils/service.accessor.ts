import { Abstract, INestApplication, Type } from '@nestjs/common';

export interface ServiceAccessor {
  getService: <T>(service: Type<T> | Abstract<T> | string | symbol) => T;
}

export const getServiceAccessor = (app: INestApplication): ServiceAccessor => ({
  getService: <T>(service: Type<T> | Abstract<T> | string | symbol): T => app.get<T>(service),
});

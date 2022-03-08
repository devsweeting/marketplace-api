/* eslint-disable @typescript-eslint/no-var-requires */
import createAssetResource from './resources/asset/asset.resource';
import createAttributeResource from './resources/attribute/attribute.resource';
import createPartnerResource from './resources/partner/partner.resource';

const getAdminJSOptions = {
  adminJsOptions: {
    rootPath: '/admin',
    branding: {
      companyName: 'Jump.co',
      softwareBrothers: false,
    },
    resources: [createAssetResource(), createAttributeResource(), createPartnerResource()],
    databases: [],
  },
};

export default getAdminJSOptions;

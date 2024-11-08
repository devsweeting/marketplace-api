import { Init1652279127303 } from './1652279127303-Init';
import { AssetIndexing1653052300775 } from './1653052300775-AssetIndexing';
import { UserOtp1653559169560 } from './1653559169560-UserOtp';
import { UpdateContractAndTokenTable1655296809164 } from './1655296809164-UpdateContractAndTokenTable';
import { CreateSellOrderTable1657555594640 } from './1657555594640-CreateSellOrderTable';
import { FileAbsoluteUrl1658255319302 } from './1658255319302-FileAbsoluteUrl';
import { AddAssetAttributeJSONColumn1659551642976 } from './1659551642976-AddAssetAttributeJSONColumn';
import { FixAttrsLowerCase1660061994750 } from './1660061994750-FixAttrsLowerCase';
import { AddFractionQtyTotal1660149486573 } from './1660149486573-AddFractionQtyTotal';
import { AddSellOrderColumns1660154769352 } from './1660154769352-AddSellOrderColumns';
import { CreateSellOrderPurchasesTable1660164905288 } from './1660164905288-CreateSellOrderPurchasesTable';
import { ModifySellOrderDateColumns1660760132910 } from './1660760132910-ModifySellOrderDateColumns';
import { AddDropLimits1660941495793 } from './1660941495793-AddDropLimits';
import { RenameUrlToSourceUrl1661270005764 } from './1661293286632-RenameUrlToSourceUrl';
import { UpdateTypeOrmMetadata1662416585994 } from './1662416585994-UpdateTypeOrmMetadata';
import { FixSellOrder1662423096730 } from './1662423096730-FixSellOrder';
import { CreateRefreshTokenTable1663795468354 } from './1663795468354-CreateRefreshTokenTable';
import { AddAssetIdToSellOrderPurchase1663352346588 } from './1663352346588-AddAssetIdToSellOrderPurchase';
import { CreateUserAssetsTable1665784042941 } from './1665784042941-CreateUserAssetsTable';
import { CreateUserPaymentsAccountTable1668198230651 } from './1668198230651-CreateUserPaymentsAccountTable';
import { AddAdditionalPaymentsAccountInfoFix1669840035959 } from './1669840035959-AddAdditionalPaymentsAccountInfoFix';
import { addTermsAndServicesToPaymentUser1671224234531 } from './1671224234531-add-terms-and-services-to-paymentUser';
import { addTermsAndNodeAgreement1670963001717 } from './1670963001717-addTermsAndNodeAgreement';
import { addUserAgreementField1670270624511 } from './1670270624511-addUserAgreementField';
import { AddStripePurchaseTracking1680288698036 } from './1680288698036-AddStripePurchaseTracking';

export const migrations = [
  Init1652279127303,
  AssetIndexing1653052300775,
  UserOtp1653559169560,
  UpdateContractAndTokenTable1655296809164,
  CreateSellOrderTable1657555594640,
  FileAbsoluteUrl1658255319302,
  AddAssetAttributeJSONColumn1659551642976,
  FixAttrsLowerCase1660061994750,
  AddFractionQtyTotal1660149486573,
  AddSellOrderColumns1660154769352,
  CreateSellOrderPurchasesTable1660164905288,
  ModifySellOrderDateColumns1660760132910,
  AddDropLimits1660941495793,
  RenameUrlToSourceUrl1661270005764,
  UpdateTypeOrmMetadata1662416585994,
  FixSellOrder1662423096730,
  CreateRefreshTokenTable1663795468354,
  AddAssetIdToSellOrderPurchase1663352346588,
  CreateUserAssetsTable1665784042941,
  CreateUserPaymentsAccountTable1668198230651,
  AddAdditionalPaymentsAccountInfoFix1669840035959,
  addUserAgreementField1670270624511,
  addTermsAndNodeAgreement1670963001717,
  addTermsAndServicesToPaymentUser1671224234531,
  AddStripePurchaseTracking1680288698036,
];

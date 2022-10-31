import { Asset, Attribute, Contract, Label, Media, Token } from 'modules/assets/entities';
import { File } from 'modules/storage/entities/file.entity';
import { Partner, PartnerMemberUser } from 'modules/partners/entities';
import { User, UserLogin, UserOtp } from 'modules/users/entities';
import { Session } from 'modules/auth/session/session.entity';
import { Event } from 'modules/events/entities';
import { Collection, CollectionAsset } from 'modules/collections/entities';
import { Log } from 'modules/log/entities/log.entity';
import { Watchlist, WatchlistAsset } from 'modules/watchlists/entities';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { UserRefresh } from 'modules/users/entities/user-refresh.entity';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import { UserSynapse } from 'modules/synapse/entities/user-synapse.entity';

export const entities = [
  Asset,
  Attribute,
  Label,
  File,
  Partner,
  PartnerMemberUser,
  Contract,
  User,
  Session,
  Event,
  Token,
  Collection,
  CollectionAsset,
  Log,
  Media,
  Watchlist,
  WatchlistAsset,
  UserAsset,
  UserOtp,
  UserLogin,
  UserRefresh,
  UserSynapse,
  SellOrder,
  SellOrderPurchase,
];

import { registerAs } from '@nestjs/config';
import { Asset, Attribute, Contract, Label, Media, Token } from 'modules/assets/entities';
import { File } from 'modules/storage/entities/file.entity';
import { Partner, PartnerMemberUser } from 'modules/partners/entities';
import { Session } from 'modules/auth/session/session.entity';
import { Event } from 'modules/events/entities';
import { Log } from 'modules/log/entities/log.entity';
import { Collection, CollectionAsset } from 'modules/collections/entities';
import { Watchlist } from 'modules/watchlists/entities/watchlist.entity';
import { WatchlistAsset } from 'modules/watchlists/entities/watchlist-asset.entity';
import { UserLogin, UserOtp, User } from 'modules/users/entities';

export default registerAs('database', () => {
  return {
    default: {
      type: process.env.TYPEORM_CONNECTION,
      host: process.env.TYPEORM_HOST,
      port: process.env.TYPEORM_PORT,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      dropSchema: process.env.NODE_ENV === 'test',
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      logging: process.env.TYPEORM_LOGGING,
      migrationsRun: process.env.TYPEORM_AUTOMIGRATION === 'true',
      autoLoadEntities: false,
      keepConnectionAlive: true,
      migrations: [process.env.TYPEORM_MIGRATIONS],
      entities: [
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
        UserOtp,
        UserLogin,
      ],
    },
  };
});

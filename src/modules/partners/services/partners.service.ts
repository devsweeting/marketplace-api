import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { User } from 'modules/users/user.entity';
import { UpdatePartnerMembersDto } from '../dto';
import { Partner, PartnerMemberUser } from '../entities';
import { EmailNotFoundException } from '../exceptions/email-not-found.exception';
import { PartnerNotFoundException } from '../exceptions/partner-not-found.exception';

@Injectable()
export class PartnersService extends BaseService {
  public async updatePartnerMembers(partner: Partner, dto: UpdatePartnerMembersDto) {
    const getPartner = await Partner.findOne({ where: { id: partner.id, isDeleted: false } });
    if (!getPartner) {
      throw new PartnerNotFoundException();
    }
    const errors = [];

    const members = (
      await Promise.all(
        dto.emails.map(async (email: string) => {
          const user = await User.findOne({ where: { email, isDeleted: false } });
          if (!user) {
            Logger.log(`This email does not exists ${email}`);
            errors.push(email);
            return null;
          }
          return user;
        }),
      )
    ).filter((e) => e !== null);

    if (members.length) {
      await Promise.all(
        members.map(async (member) => {
          const entity = new PartnerMemberUser();
          entity.partnerId = getPartner.id;
          entity.userId = member.id;
          return await entity.save();
        }),
      );
    }
    if (!members.length && errors.length) {
      throw new EmailNotFoundException();
    }
    return members;
  }
}

import { Session } from './session.entity';

import { Injectable } from '@nestjs/common';
import { SessionNotFoundException } from 'modules/common/exceptions/session-not-found.exception';

@Injectable()
export class SessionService {
  public findById(id: string): Promise<Session | null> {
    return Session.findOne({ where: { id } });
  }

  public async getById(id: string): Promise<Session> {
    const session = await this.findById(id);

    if (!session) {
      throw new SessionNotFoundException();
    }

    return session;
  }
}

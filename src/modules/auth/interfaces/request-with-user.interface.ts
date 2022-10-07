import { Request } from 'express';
import { User } from 'modules/users/entities/user.entity';

interface IRequestWithUser extends Request {
  user: User;
}

export default IRequestWithUser;

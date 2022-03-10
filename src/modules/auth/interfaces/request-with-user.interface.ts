import { Request } from 'express';
import { User } from 'modules/users/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;

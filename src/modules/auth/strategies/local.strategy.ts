// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { User } from 'modules/users/entities/user.entity';
// import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
//   constructor(private readonly authService: AuthService) {
//     super({
//       usernameField: 'address',
//       passwordField: 'signature',
//     });
//   }

//   async validate(address: string, signature: string): Promise<Partial<User>> {
//     return this.authService.validateUser(address, signature);
//   }
// }

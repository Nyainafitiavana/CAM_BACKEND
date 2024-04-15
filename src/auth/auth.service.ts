import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthInterface } from './auth.interface';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<AuthInterface> {
    const user: User = await this.userService.findOneByEmail(email);

    if (!user) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: `Cet e-mail ${email} n'a pas été trouvé`,
      };
    }

    if (password !== user.password) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Mot de passe incorrect !',
      };
    }

    delete user.password;

    return {
      statusCode: HttpStatus.OK,
      message: 'Login success',
      access_token: await this.jwtService.signAsync({ user }),
      is_admin: user.is_admin,
    };
  }
}

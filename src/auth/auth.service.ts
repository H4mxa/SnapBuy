import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaError } from 'src/utils/prismaError';
import { UserNotFoundException } from 'src/users/exceptions/userNotFound.exception';
import { UserResponseDto } from 'src/users/dto/userResponseDto';
import { plainToClass } from 'class-transformer';
import { CreateHttpResponse } from 'src/utils/createResponse';
import { HTTP_RESPONSE_STRINGS } from 'src/utils/httpResponseStrings';
import { BlacklistService } from 'src/shared/blacklist.service';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { Tokens } from './types';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
    private config: ConfigService,
  ) {}

  // `Signup` Route
  async signup(dto: AuthSignupDto, role: Role): Promise<Tokens> {
    const password = await this.generateArgonHash(dto.password);
    try {
      const newUser = await this.usersService.create({
        ...dto,
        password,
        role,
      });
      const tokens: Tokens = await this.generateTokens(
        newUser.id,
        newUser.username,
        newUser.role,
      );
      await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PrismaError.UniqueConstraintFailed) {
          throw new ForbiddenException('Email Already Exist');
        }
      }
      throw error;
    }
  }

  // `SignIn` Route
  async signin(dto: AuthSigninDto): Promise<Tokens> {
    const user = await this.usersService.getByEmail(dto.email);
    if (!user) throw new ForbiddenException('Access Denied');
    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');
    const tokens: Tokens = await this.generateTokens(
      user.id,
      user.username,
      user.role,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  // `Logout` Route
  async logout(userId: number) {
    await this.usersService.updateMany(userId);
  }

  // `RefreshToken` Route
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.getById(userId);

    if (!user || !user.hashedRT) throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await argon2.verify(
      user.hashedRT,
      refreshToken,
    );

    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens: Tokens = await this.generateTokens(
      user.id,
      user.username,
      user.role,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  /* --- Utility Functions --- */

  async generateArgonHash(data: string): Promise<string> {
    return await argon2.hash(data);
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await this.generateArgonHash(refreshToken);
    await this.usersService.updateRefreshTokenHash({
      userId,
      hash,
    });
  }

  async generateTokens(
    userId: number,
    username: string,
    role: string,
  ): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          role,
        },
        {
          secret: this.config.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
          expiresIn: this.config.get('ACCESS_TOKEN_LIFE_TIME') * 60,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          role,
        },
        {
          secret: this.config.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
          expiresIn: this.config.get('REFRESH_TOKEN_LIFE_TIME') * 24 * 60 * 60,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // async registerUser(
  //   registrationData: RegisterDto,
  //   role: Role,
  // ): Promise<Partial<RegisterDto>> {
  //   const hashedPassword = await bcrypt.hash(registrationData.password, 10);
  //   try {
  //     await this.usersService.create({
  //       ...registrationData,
  //       password: hashedPassword,
  //       role,
  //     });

  //     // const filteredResponse = plainToClass(RegisterResponseDto, createdUser);

  //     return CreateHttpResponse({
  //       success: true,
  //       message: HTTP_RESPONSE_STRINGS.USER_CREATED,
  //     });
  //   } catch (error) {
  //     if (
  //       error instanceof Prisma.PrismaClientKnownRequestError &&
  //       error?.code === PrismaError.UniqueConstraintFailed
  //     ) {
  //       throw new HttpException(
  //         'User with that email already exists',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     throw new HttpException(
  //       'Something went wrong',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async login(data: LoginDto) {
  //   const user: User = await this.usersService.getByEmail(data.email);

  //   if (!user) {
  //     throw new UserNotFoundException();
  //   }

  //   await this.verifyPassword(data.password, user.password);

  //   const payload = { userId: user.id, user: user.name, role: user.role };
  //   let access_token = await this.jwtService.sign(payload);

  //   let response = {
  //     ...user,
  //     access_token,
  //   };

  //   const filteredResponse = plainToClass(UserResponseDto, response);
  //   return CreateHttpResponse({
  //     data: filteredResponse,
  //     message: HTTP_RESPONSE_STRINGS.USER_CREATED,
  //     success: true,
  //   });
  // }

  // async logout(authToken: string) {
  //   const token = authToken.split(' ')[1];
  //   this.blacklistService.addToBlacklist(token);
  // }

  // private async verifyPassword(
  //   plainTextPassword: string,
  //   hashedPassword: string,
  // ) {
  //   const isPasswordMatching = await bcrypt.compare(
  //     plainTextPassword,
  //     hashedPassword,
  //   );
  //   if (!isPasswordMatching) {
  //     throw new BadRequestException('Wrong credentials provided');
  //   }
  // }
}

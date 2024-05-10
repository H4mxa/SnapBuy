import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, getCurrentUser, getCurrentUserId } from './decorators';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { Tokens } from './types';
import { Role } from './enums/role.enum';
import { Roles } from './decorators/roles.decorator';
import { RtGuard } from './guards';
import { RoleGuard } from './guards/role.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthSignupDto): Promise<Tokens> {
    console.log('dto: ', dto);
    return this.authService.signup(dto, Role.GUEST);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: AuthSigninDto): Promise<Tokens> {
    return this.authService.signin(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.ADMIN)
  // @UseGuards(RoleGuard)
  logout(@getCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @getCurrentUserId() userId: number,
    @getCurrentUser('refreshToken') refreshToken: string,
  ) {
    console.log('my referesh TOken: ', refreshToken);
    console.log('my userId userId: ', userId);

    return this.authService.refreshTokens(userId, refreshToken);
  }

  // @Get('profile')
  // @Roles(Role.ADMIN)
  // @UseGuards(AuthGuard, RoleGuard)
  // getProfile(@Request() req) {
  //   return {
  //     user: 'success',
  //   };
  // }
}

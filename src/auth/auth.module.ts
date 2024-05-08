import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleGuard } from 'src/guards/role.guard';
import { AccessContorlService } from 'src/shared/access-control.service';
import { BlacklistService } from 'src/shared/blacklist.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}h`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RoleGuard, AccessContorlService, BlacklistService],
  exports: [AuthService],
})
export class AuthModule {}

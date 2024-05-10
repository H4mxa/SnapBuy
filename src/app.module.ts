import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guards';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    VideosModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
        RATE_LIMIT_TIME_TO_LIVE: Joi.number().required(),
        RATE_LIMIT_MAX_NUMBER_REQUEST: Joi.number().required(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TIME_TO_LIVE),
        limit: parseInt(process.env.RATE_LIMIT_MAX_NUMBER_REQUEST),
      },
    ]),
  ],
  providers: [
    { provide: APP_GUARD, useClass: AtGuard },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

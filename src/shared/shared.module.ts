import { Module } from '@nestjs/common';
import { AccessContorlService } from './access-control.service';
import { BlacklistService } from './blacklist.service';

@Module({
  providers: [AccessContorlService],
  exports: [AccessContorlService, BlacklistService],
})
export class AccessContorlModule {}

import { Injectable } from '@nestjs/common';

@Injectable()
export class BlacklistService {
  private blacklist: Set<string> = new Set();

  addToBlacklist(token: string): void {
    this.blacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }
}

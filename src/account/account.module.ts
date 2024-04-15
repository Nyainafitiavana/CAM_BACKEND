import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { PrismaModule } from '../prisma/prisma.module';
import Helper from '../../utils/helper';

@Module({
  imports: [PrismaModule],
  controllers: [AccountController],
  providers: [AccountService, Helper],
})
export class AccountModule {}

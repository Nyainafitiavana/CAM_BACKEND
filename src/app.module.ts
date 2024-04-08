import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { HistoryModule } from './history/history.module';
import { OperationModule } from './operation/operation.module';

@Module({
  imports: [UserModule, AccountModule, HistoryModule, OperationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

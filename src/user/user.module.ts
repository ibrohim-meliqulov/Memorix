
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
    imports: [SubscriptionModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
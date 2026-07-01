
import { Module } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [SubscriptionModule, UserModule],
    controllers: [FlashcardController],
    providers: [FlashcardService],
    exports: [FlashcardService],
})
export class FlashcardModule { }
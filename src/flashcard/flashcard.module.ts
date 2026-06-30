
import { Module } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
    imports: [SubscriptionModule],
    controllers: [FlashcardController],
    providers: [FlashcardService],
    exports: [FlashcardService],
})
export class FlashcardModule { }
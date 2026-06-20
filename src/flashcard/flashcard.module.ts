
import { Module } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';

@Module({
    controllers: [FlashcardController],
    providers: [FlashcardService],
    exports: [FlashcardService],
})
export class FlashcardModule { }

import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], // Boshqa modullarda (Flashcard) ishlatish uchun
})
export class AiModule { }
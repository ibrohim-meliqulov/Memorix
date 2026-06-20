import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { AiModule } from './ai/ai.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DeckModule } from './deck/deck.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: 'env',
  }), AuthModule, FlashcardModule, AiModule, UploadModule, UserModule, PrismaModule, DeckModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

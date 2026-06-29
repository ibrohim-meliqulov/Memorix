import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { DeckModule } from './deck/deck.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';
import { AppController } from './app.controller';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AiModule,
    DeckModule,
    FlashcardModule,
    UserModule,
    AuthModule,
    BotModule,
    PaymentModule
  ],
  controllers: [AppController]
})
export class AppModule { }
